// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Peta Zona Pemenangan", {
	refresh: function (frm) {
		if (!frm.is_new()) {
			// If the document is already saved, show the specific field(s)
			frm.set_df_property("map_html", "hidden", 0); // Show the field
		} else {
			// If it's a new document, hide the field(s)
			frm.set_df_property("map_html", "hidden", 1); // Hide the field
		}
	},
	title: function (frm) {
		if (frm.doc.title) {
			frm.set_value(
				"slug",
				frm.doc.title
					.toLowerCase()
					.replace(/\s+/g, "-")
					.replace(/[^\w\-]+/g, "")
			);
		}
	},
	onload: function (frm) {
		$(document).ready(function () {
			if (!frm.is_new()) {
        // Hide the Save button
        frm.disable_save();
				// Initialize and render the map
				initializeMap(frm);
			}
		});
	},
});

const getAuthToken = {
	method: "GET",
	headers: {
		Authorization: "token cd754cb9cb11245:bcfbb763644ab54",
		"Content-Type": "application/json",
	},
};

let previousBounds = null;
let previousZoomLevel = null;
let region_code = null;

function initializeMap(frm) {
	// Check if the map container already exists
	if (!frm.fields_dict["map_html"] || !frm.fields_dict["map_html"].$wrapper) {
		console.error("Map container not found.");
		return;
	}

	region_code = frm.doc.parent_code;

	// Set up the map inside the Doctype form
	var mapContainer = frm.fields_dict["map_html"].$wrapper.html(
		'<div id="leaflet_map" style="height: 600px;"></div>'
	);

	// Initialize Leaflet map
	const map = L.map("leaflet_map").setView([-2.5, 118], 5); // Center on Indonesia

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	// loadProvinces(map);
	fetchCities(region_code, map);

	// Add Back Button
	const backButton = L.control({ position: "topright" });
	backButton.onAdd = function () {
		const button = L.DomUtil.create(
			"button",
			"leaflet-bar leaflet-control leaflet-control-custom"
		);
		button.innerHTML = "Back";
		button.style.backgroundColor = "white";
		button.style.width = "60px";
		button.style.height = "30px";
		button.onclick = function () {
			if (previousBounds) {
				map.fitBounds(previousBounds);
				map.setZoom(previousZoomLevel);
				previousBounds = null; // Clear previous bounds after use
			}
		};
		return button;
	};
	backButton.addTo(map);
}

function applyStyle(feature) {
	return {
		color: feature.properties.color, // Use color from the GeoJSON
		weight: 2, // Border thickness
		opacity: 1, // Border opacity
		fillOpacity: 0.5, // Fill opacity
		fillColor: feature.properties.color, // Fill color from the GeoJSON
	};
}

async function loadProvinces(map) {
	try {
		const url = `/api/method/polmark_dashboard.api.geojson.get_provinces?province_id=${region_code}`;
		const response = await fetch(url, getAuthToken);
		const data = await response.json();

		L.geoJSON(data.message, {
			style: applyStyle,
			onEachFeature: (feature, layer) => onEachFeatureProvince(feature, layer, map),
		}).addTo(map);
	} catch (error) {
		console.error("Error loading provinces:", error);
	}
}

function onEachFeatureProvince(feature, layer, map) {
	layer.on({
		click: function () {
			previousBounds = map.getBounds();
			previousZoomLevel = map.getZoom();
			const provinceId = feature.properties.region_code; // Replace with your actual ID property
			fetchCities(provinceId, map);
		},
	});
}

async function fetchCities(provinceId, map) {
	try {
		const url = `/api/method/polmark_dashboard.api.geojson.get_cities?province_id=${provinceId}`;
		const response = await fetch(url, getAuthToken);
		const cityData = await response.json();

		// Clear previous layers
		map.eachLayer(function (layer) {
			if (layer instanceof L.GeoJSON) {
				map.removeLayer(layer);
			}
		});

		// Add cities to the map
		const geojsonLayer = L.geoJSON(cityData.message, {
			style: applyStyle,
			onEachFeature: (feature, layer) => onEachFeatureCity(feature, layer, map),
		}).addTo(map);

		// Zoom to the city level
		previousBounds = map.getBounds();
		previousZoomLevel = map.getZoom();
		const bounds = L.geoJSON(cityData.message).getBounds();
		map.fitBounds(bounds);
	} catch (error) {
		console.error("Error fetching cities:", error);
	}
}

function onEachFeatureCity(feature, layer, map) {
	let labelText = feature.properties.name;

	// Calculate the center of the feature's bounds
	const markerCenter = layer.getBounds().getCenter();
	const markerLabel = L.divIcon({
		className: "province-label",
		html: `<div class="peta-label-content">
    <span class="peta-label-text">${labelText}</span>
    </div>`,
	});

	// Add a label at the center of the feature
	L.marker(markerCenter, { icon: markerLabel }).addTo(map);

	layer.on({
		click: function () {
			// Handle click event for cities if needed
		},
	});
}
