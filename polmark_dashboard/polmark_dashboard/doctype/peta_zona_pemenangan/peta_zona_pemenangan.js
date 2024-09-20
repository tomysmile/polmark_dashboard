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

function initializeMap(frm) {
	// Check if the map container already exists
	if (!frm.fields_dict["map_html"] || !frm.fields_dict["map_html"].$wrapper) {
		console.error("Map container not found.");
		return;
	}

	region_code = frm.doc.region;
	region_level = frm.doc.level;

	// Set up the map inside the Doctype form
	var mapContainer = frm.fields_dict["map_html"].$wrapper.html(
		'<div id="leaflet_map" style="height: 600px;"></div>'
	);

	// Initialize Leaflet map
	const map = L.map("leaflet_map").setView([-2.5, 118], 5); // Center on Indonesia

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	loadGeoJson(map, region_code, region_level);
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

async function loadGeoJson(map, code, level) {
	const url = `/api/method/polmark_dashboard.api.geojson.get_geojson_data?region=${code}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.message) {
			var geoJson = data.message;
			map.fitBounds(L.geoJSON(geoJson).getBounds());

			// Add GeoJSON layer and display city names in the center
			var geoLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
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

					// Bind a popup to display the information
					layer.bindPopup(`
            <div class="popup-content">
                <h3 class="popup-title">${feature.properties.name}</h3>
                <ul class="popup-info">
                    <li><i class="fas fa-landmark"></i> <span class="popup-label">Dapil DPR RI:</span> ${feature.properties.dapil_dpr_ri}</li>
                    <li><i class="fas fa-landmark"></i> <span class="popup-label">Jumlah TPS:</span> ${feature.properties.jml_tps}</li>
                    <li><i class="fas fa-users"></i> <span class="popup-label">Jumlah Penduduk:</span> ${feature.properties.jml_pend}</li>
                    <li><i class="fas fa-user-check"></i> <span class="popup-label">Jumlah KK:</span> ${feature.properties.jml_kk}</li>
                    <li><i class="fas fa-user-check"></i> <span class="popup-label">Jumlah CDE:</span> ${feature.properties.jml_cde}</li>
                    <li><i class="fas fa-user-check"></i> <span class="popup-label">Jumlah Pemilih:</span> ${feature.properties.jml_dpt}</li>
                    <li><i class="fas fa-user-check"></i> <span class="popup-label">Jumlah Pemilih per-KK:</span> ${feature.properties.jml_dpt_perkk}</li>
                    <li><i class="fas fa-user-check"></i> <span class="popup-label">Jumlah Pemilih Perempuan:</span> ${feature.properties.jml_dpt_perempuan}</li>
                    <li><i class="fas fa-user-check"></i> <span class="popup-label">Jumlah Pemilih Muda:</span> ${feature.properties.jml_dpt_muda}</li>
                    <li><i class="fas fa-map-marker-alt"></i> <span class="popup-label">Zonasi:</span> ${feature.properties.zonasi}</li>
                </ul>
            </div>
          `);

					// Zoom into the city when clicked
					// layer.on("click", function (e) {
					// 	var regionName = feature.properties.name;
					// 	if (regionName === "Jakarta") {
					// 		zoomToCity(map, "Jakarta");
					// 	}
					// });
				},
			}).addTo(map);
		}
	} catch (error) {
		console.error("Error loading geojson:", error);
	}
}

function zoomToCity(map, city) {
	frappe.call({
		method: "your_app_name.your_module_name.api.get_geojson_data",
		args: { region: city },
		callback: function (r) {
			if (r.message) {
				var cityGeoJson = r.message;
				map.eachLayer(function (layer) {
					if (layer instanceof L.GeoJSON) {
						map.removeLayer(layer); // Remove previous layers
					}
				});
				L.geoJSON(cityGeoJson).addTo(map);
				map.fitBounds(L.geoJSON(cityGeoJson).getBounds());
			}
		},
	});
}
