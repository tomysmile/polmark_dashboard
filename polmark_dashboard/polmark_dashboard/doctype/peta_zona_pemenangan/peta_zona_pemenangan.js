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
let region_level = null;
// Stack to hold previous views
var previousViews = [];
var cityZoomLevel = 10; // Define your city zoom level

// Province marker array to store references
let provinceMarkers = [];
let provinceLayer = null;
let cityMarkers = [];
let cityLayer = null;
let districtMarkers = [];
let districtLayer = null;

let currentLevel = 0;
let indonesiaDefaultView = [-2.5489, 118.0149];
let provinceDefaultView = [];
let cityDefaultView = [];

function initializeMap(frm) {
	// Check if the map container already exists
	if (!frm.fields_dict["map_html"] || !frm.fields_dict["map_html"].$wrapper) {
		console.error("Map container not found.");
		return;
	}

	region_code = frm.doc.region;
	region_level = frm.doc.level_code;

	// Set up the map inside the Doctype form
	frm.fields_dict["map_html"].$wrapper.html(
		'<div id="leaflet_map" style="height: 600px;"></div>'
	);

	// Initialize Leaflet map
	const map = L.map("leaflet_map").setView(indonesiaDefaultView, 5); // Center on Indonesia

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	// Create back button control
	var backButton = L.control({ position: "topright" });

	backButton.onAdd = function (map) {
		var div = L.DomUtil.create("div", "back-button");
		div.innerHTML = '<button type="button">Back</button>';
		div.onclick = function () {
			// zoomBack(); // Navigate back

			if (region_level === "3") {
				fetchProvinces(map, region_code, provinceMarkers);
			}

			map.setView(provinceDefaultView, 5); // Reset zoom to provinces
			div.style.display = "none"; // Hide back button
		};
		div.style.display = "none"; // Initially hidden
		return div;
	};

	backButton.addTo(map);
	document.querySelector(".back-button").style.display = "none"; // Hide on load

	// Add fullscreen control to the map
	map.addControl(new L.Control.Fullscreen());

	// Event triggered when the map enters fullscreen
	map.on("enterFullscreen", function () {
		console.log("Entered fullscreen mode");
	});

	// Event triggered when the map exits fullscreen
	map.on("exitFullscreen", function () {
		console.log("Exited fullscreen mode");
	});

	map.on("moveend", function () {
		let center = map.getCenter();
		// console.log("New center coordinates:", center.lat, center.lng);
	});

	// Initial load of map
	// loadGeoJson(map, region_code, region_level);
	if (region_level === "3") {
		fetchProvinces(map, region_code, provinceMarkers);
	}
}

function getColor(zonasi) {
	switch (zonasi) {
		case "ZONA 1":
			return "#FF9999"; // Light Red
		case "ZONA 2":
			return "#99FF99"; // Light Green
		case "ZONA 3":
			return "#9999FF"; // Light Blue
		case "ZONA 4":
			return "#FFFF99"; // Light Yellow
		default:
			return "#CCCCCC"; // Default gray for unknown zonasi
	}
}

function applyStyle(feature) {
	return {
		fillColor: getColor(feature.properties.zonasi),
		weight: 2,
		opacity: 1,
		color: "white", // Border color
		fillOpacity: 0.7, // Opacity of the fill color
	};
}

// Function to calculate the centroid for a Polygon (in case some features are Polygons)
function getCentroid(coordinates) {
	let totalLat = 0,
		totalLng = 0,
		totalPoints = 0;

	// Assuming the coordinates array is a Polygon: [ [ [lng, lat], [lng, lat], ... ] ]
	coordinates[0].forEach(function (coord) {
		totalLng += coord[0];
		totalLat += coord[1];
		totalPoints++;
	});

	if (totalPoints === 0) {
		return null; // Invalid case, no points in the polygon
	}

	return [totalLat / totalPoints, totalLng / totalPoints]; // Centroid in [lat, lng] format
}

function getMultiPolygonCentroid(coordinates) {
	let totalLat = 0,
		totalLng = 0,
		totalPoints = 0;

	// Loop through each Polygon in the MultiPolygon
	coordinates.forEach(function (polygon) {
		polygon[0].forEach(function (coord) {
			totalLng += coord[0]; // Longitude
			totalLat += coord[1]; // Latitude
			totalPoints++;
		});
	});

	if (totalPoints === 0) {
		return null; // Invalid case, no points in the polygons
	}

	return [totalLat / totalPoints, totalLng / totalPoints]; // Centroid in [lat, lng] format
}

function showLabelMarker(map, feature) {
  var centroid;

	// Check if it's a MultiPolygon
	if (feature.geometry.type === "MultiPolygon") {
		centroid = getMultiPolygonCentroid(feature.geometry.coordinates);
	} else if (feature.geometry.type === "Polygon") {
		centroid = getCentroid(feature.geometry.coordinates);
	}

  // Ensure centroid is valid before adding marker
	if (centroid) {
		// Add city name label in the center
		const markerLabel = L.divIcon({
			className: "province-label",
			html: `<div class="peta-label-content">
	            <span class="peta-label-text">${feature.properties.name}</span>
	            </div>`,
		});

		L.marker(centroid, { icon: markerLabel }).addTo(map);
	} else {
		console.error("Invalid centroid for feature:", feature.properties.name);
	}
}

function showPopup(layer, feature) {
	// Bind a popup to display the information
	layer.bindPopup(`
    <div class="popup-content">
        <h3 class="popup-title">${feature.properties.name}</h3>
        <ul class="popup-info">
            <li><i class="fas fa-landmark"></i> <span class="popup-label">Dapil DPR RI:</span> ${feature.properties.dapil_dpr_ri}</li>
            <li><i class="fas fa-landmark"></i> <span class="popup-label">TPS:</span> ${feature.properties.jml_tps}</li>
            <li><i class="fas fa-users"></i> <span class="popup-label">Penduduk:</span> ${feature.properties.jml_pend}</li>
            <li><i class="fas fa-user-check"></i> <span class="popup-label">KK:</span> ${feature.properties.jml_kk}</li>
            <li><i class="fas fa-user-check"></i> <span class="popup-label">CDE:</span> ${feature.properties.jml_cde}</li>
            <li><i class="fas fa-user-check"></i> <span class="popup-label">Pemilih:</span> ${feature.properties.jml_dpt}</li>
            <li><i class="fas fa-user-check"></i> <span class="popup-label">Pemilih per-KK:</span> ${feature.properties.jml_dpt_perkk}</li>
            <li><i class="fas fa-user-check"></i> <span class="popup-label">Pemilih Perempuan:</span> ${feature.properties.jml_dpt_perempuan}</li>
            <li><i class="fas fa-user-check"></i> <span class="popup-label">Pemilih Muda:</span> ${feature.properties.jml_dpt_muda}</li>
            <li><i class="fas fa-map-marker-alt"></i> <span class="popup-label">Zonasi:</span> ${feature.properties.zonasi}</li>
        </ul>
    </div>
  `);
}

function fetchGeoJsonData(endpoint, params = {}) {
	return new Promise((resolve, reject) => {
		frappe.call({
			method: endpoint,
			args: params,
			callback: function (r) {
				if (r.message) {
					resolve(r.message);
				} else {
					reject("No data found");
				}
			},
			error: function (err) {
				reject(err);
			},
		});
	});
}

function fetchProvinces(map, code, provinceMarkers) {
	cityMarkers.forEach((marker) => {
		map.removeLayer(marker);
	});
	cityMarkers = [];

	// Clear any existing city layers
	map.eachLayer((layer) => {
		if (layer instanceof L.GeoJSON) {
			map.removeLayer(layer);
		}
	});

	currentLevel = 3;

	const url = `polmark_dashboard.api.geojson.get_geojson_data?region=${code}`;
	fetchGeoJsonData(url)
		.then((geoJson) => {
			if (!geoJson || geoJson.features.length === 0) {
				console.error("No valid province data found");
				map.setView(indonesiaDefaultView, 5); // Set default view if no data
				return;
			}

			provinceLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
					// showPopup(layer, feature);

					// Store province markers and icons in an array
					let marker = L.marker(layer.getBounds().getCenter(), {
						icon: L.divIcon({
							className: "province-label",
							html: `<div class="peta-label-content">
                      <span class="peta-label-text">${feature.properties.name}</span>
                      </div>`,
						}),
					}).addTo(map);

					// Add marker to the array
					provinceMarkers.push(marker);

					layer.on("click", function () {
						fetchCities(map, feature.properties.region_code, provinceMarkers);
					});
				},
			}).addTo(map);

			// Fit the map to the bounds of the provinces layer
			let bounds = provinceLayer.getBounds();
			if (bounds.isValid()) {
				map.fitBounds(bounds); // Fit map to the provinces' bounds
			} else {
				console.error("Bounds are not valid");
				map.setView(indonesiaDefaultView, 5); // Set default view if bounds are invalid
			}

			provinceDefaultView = map.getCenter();
		})
		.catch((error) => {
			console.error("Error fetching provinces:", error);
			map.setView(indonesiaDefaultView, 5); // Set default view on error
		});
}

// Function to fetch and render cities based on province ID
function fetchCities(map, code, provinceMarkers) {
	// Remove all province markers from the map
	provinceMarkers.forEach((marker) => {
		map.removeLayer(marker);
	});
	provinceMarkers = []; // Clear the array

	// Remove the province layer from the map
	if (provinceLayer) {
		map.removeLayer(provinceLayer);
	}

	currentLevel = 4;

	const url = `polmark_dashboard.api.geojson.get_geojson_data?region=${code}`;
	fetchGeoJsonData(url)
		.then((geoJson) => {
			cityLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
					// Custom events for cities
					let marker = L.marker(layer.getBounds().getCenter(), {
						icon: L.divIcon({
							className: "province-label",
							html: `<div class="peta-label-content">
                      <span class="peta-label-text">${feature.properties.name}</span>
                      </div>`,
						}),
					}).addTo(map);

					// Add marker to the array
					cityMarkers.push(marker);

          showPopup(layer, feature);
				},
			}).addTo(map);

			// map.addLayer(cityLayer);
			map.fitBounds(cityLayer.getBounds());
			document.querySelector(".back-button").style.display = "block"; // Show back button

			cityDefaultView = map.getCenter();
		})
		.catch((error) => console.error("Error fetching cities:", error));
}
