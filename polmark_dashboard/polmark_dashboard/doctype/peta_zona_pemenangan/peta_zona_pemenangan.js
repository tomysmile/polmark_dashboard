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

				// Initialize the map and other functionalities after the tabs are rendered
				setTimeout(() => {
					initializeLeafletMap(frm);
				}, 0);
			}
		});
	},
});

// Marker array to store references
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

let locationLabel;

function initializeLeafletMap(frm) {
	// Check if the map container already exists
	if (!frm.fields_dict["map_html"] || !frm.fields_dict["map_html"].$wrapper) {
		console.error("Map container not found.");
		return;
	}

	// Set up the map inside the Doctype form
	frm.fields_dict["map_html"].$wrapper.html(`
    <div id="map-container" style="position: relative;">
      	<div id="leaflet-map" style="height: 80vh;">
	  		<div id="databox-tooltip" style="position:absolute; bottom:25px; right:18px; padding:10px; background-color:white; border:1px solid #ccc; display:none; z-index:1000;">
                <table id="tooltip-table" style="border-collapse: collapse; width: 100%;">
                    <tbody>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Kode Wilayah</th>
                            <td id="area-code" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Nama</th>
                            <td id="area-name" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Status</th>
                            <td id="area-status" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Level</th>
                            <td id="level" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Dapil DPR RI</th>
                            <td id="dapil-dprri" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr id="row-number-of-kec" style="display:none;">
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Jml Kecamatan</th>
                            <td id="number-of-kec" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr id="row-number-of-kel" style="display:none;">
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Jml Kelurahan</th>
                            <td id="number-of-kel" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr id="row-number-of-desa" style="display:none;">
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Jml Desa</th>
                            <td id="number-of-desa" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Jml TPS</th>
                            <td id="jml-tps" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Penduduk</th>
                            <td id="jml-pend" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">KK</th>
                            <td id="jml-kk" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Pemilih 2024</th>
                            <td id="jml-dpt-2024" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">CDE</th>
                            <td id="jml-cde" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Pemilih /KK</th>
                            <td id="jml-pemilih-kk" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Pemilih Perempuan</th>
                            <td id="jml-pemilih-perempuan" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Pemilih Muda</th>
                            <td id="jml-pemilih-muda" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
						<tr>
                            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Zonasi</th>
                            <td id="zonasi" style="padding: 5px; border-bottom: 1px solid #ccc;"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
		</div>
    </div>
  	`);

	// Initialize Leaflet map
	const map = L.map("leaflet-map").setView(indonesiaDefaultView, 5); // Center on Indonesia

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	region_code = frm.doc.region;
	region_level = frm.doc.level_code;
	region_name = frm.doc.region_name;

	// Create label
	locationLabel = L.control({ position: "topright" });
	locationLabel.onAdd = function (map) {
		let div = L.DomUtil.create("div", "location-label");
		div.innerHTML = `<h2>${region_name}</h2>`; // Default label for Indonesia
		return div; // Return the created DOM element
	};
	locationLabel.addTo(map);

	// Create back button control
	let backButton = L.control({ position: "topright" });
	backButton.onAdd = function (map) {
		let div = L.DomUtil.create("div", "back-button");
		div.innerHTML = '<button type="button">Back</button>';
		div.onclick = function () {
			if (region_level === "3") {
				fetchProvinces(frm, map, region_code, provinceMarkers);
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
	});

	// Add the legend to the map
	addLegend(map);

	// Initial load of map
	if (region_level === "3") {
		fetchProvinces(frm, map, region_code, provinceMarkers);
	}
}

function getColor(zone) {
	return zone === "ZONA 1"
		? "#ff9999" // Light Red for zone 1
		: zone === "ZONA 2"
		? "#ffff99" // Light Yellow for zone 2
		: zone === "ZONA 3"
		? "#99ff99" // Light Green for zone 3
		: "#ffffff"; // Default color (white) for undefined zones
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

// Function to style each area (e.g., based on some property)
function styleArea(feature) {
	return {
		fillColor: getColor(feature.properties.color), // Color based on property
		weight: 1,
		opacity: 1,
		color: "white",
		fillOpacity: 0.7,
	};
}

// Function to add the legend control to the map
function addLegend(map) {
	let legend = L.control({ position: "bottomleft" });

	legend.onAdd = function (map) {
		let div = L.DomUtil.create("div", "info legend"),
			zones = ["ZONA 1", "ZONA 2", "ZONA 3"], // Zones 1, 2, 3
			labels = [];

		// Loop through the zones and create a label for each
		for (let i = 0; i < zones.length; i++) {
			labels.push('<i style="background:' + getColor(zones[i]) + '"></i> ' + zones[i]);
		}

		div.innerHTML = labels.join("<br>");
		return div;
	};

	legend.addTo(map);
}

function renderTable(frm, level, data) {
	let table = '<div class="table-responsive">';
	table +=
		'<table class="table table-bordered table-striped table-hover table-sm" style="width: 100%;">';
	table += "<thead><tr>";

	if (level == 2) {
		table += `
              <th>KD PROV</th>
              <th>PROV</th>
              <th>DAPIL DPRRI</th>
              <th>KD KABKOTA</th>
              <th>KABKOTA</th>
          `;
	} else if (level == 3) {
		table += `
              <th>KD PROV</th>
              <th>PROV</th>
              <th>DAPIL DPRRI</th>
              <th>KD KABKOTA</th>
              <th>KABKOTA</th>
              <th>KD KEC</th>
              <th>KEC</th>
          `;
	} else if (level == 4) {
		table += `
              <th>KD PROV</th>
              <th>PROV</th>
              <th>DAPIL DPRRI</th>
              <th>KD KABKOTA</th>
              <th>KABKOTA</th>
              <th>KD KEC</th>
              <th>KEC</th>
              <th>KD DESA</th>
              <th>DESA</th>
          `;
	}

	table += `
          <th>STATUS</th>
          <th>LEVEL</th>
          <th>PEND</th>
          <th>KK</th>
          <th>PEMILIH 2024</th>
          <th>CDE</th>
          <th>PEMILIH /KK</th>
          <th>PEMILIH PEREMPUAN</th>
          <th>PEMILIH MUDA</th>
          <th>ZONASI</th>
        `;

	table += "</tr></thead><tbody>";

	// Populate the table with data
	data.forEach((item) => {
		table += "<tr>";

		if (level == 2) {
			table += `
                <td>${item.kd_provinsi}</td>
                <td>${item.provinsi}</td>
                <td>${item.dapil_dpr_ri}</td>
                <td>${item.kd_kokab}</td>
                <td>${item.kokab}</td>
            `;
		} else if (level == 3) {
			table += `
                <td>${item.kd_provinsi}</td>
                <td>${item.provinsi}</td>
                <td>${item.dapil_dpr_ri}</td>
                <td>${item.kd_kokab}</td>
                <td>${item.kokab}</td>
                <td>${item.kd_kec}</td>
                <td>${item.kecamatan}</td>
            `;
		} else if (level == 4) {
			table += `
                <td>${item.kd_provinsi}</td>
                <td>${item.provinsi}</td>
                <td>${item.dapil_dpr_ri}</td>
                <td>${item.kd_kokab}</td>
                <td>${item.kokab}</td>
                <td>${item.kd_kec}</td>
                <td>${item.kecamatan}</td>
                <td>${item.kd_kel}</td>
                <td>${item.kelurahan}</td>
            `;
		}

		table += `
            <td>${item.region_type}</td>
            <td>${item.level}</td>
            <td>${item.jml_pend}</td>
            <td>${item.jml_kk}</td>
            <td>${item.jml_dpt}</td>
            <td>${item.jml_cde}</td>
            <td>${item.jml_dpt_perkk}</td>
            <td>${item.jml_dpt_perempuan}</td>
            <td>${item.jml_dpt_muda}</td>
            <td>${item.zonasi}</td>
            </tr>
          `;
	});

	table += "</tbody></table></div>";

	// Insert the table into the HTML field
	frm.fields_dict.data_table_wrapper.$wrapper.html(table);
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

function fetchProvinces(frm, map, code, provinceMarkers) {
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

			console.log("geojson province: ", geoJson);

			let parentName = "";

			provinceLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
					// get region parent name
					parentName = feature.properties.parent_name;

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
						// Hide the tooltip
						let tooltip = document.getElementById("databox-tooltip");
						tooltip.style.display = "none";

						fetchCities(frm, map, feature.properties.region_code, provinceMarkers);
					});

					layer.on("mouseover", function (e) {
						// Show the tooltip
						let tooltip = document.getElementById("databox-tooltip");
						tooltip.style.display = "block";

						// Dynamically set the tooltip background color based on the zone
						if (feature.properties.zonasi === "ZONA 1") {
							tooltip.style.backgroundColor = 'rgba(255, 102, 102, 0.8)';  // Light red for Zone 1
						} else if (feature.properties.zonasi === "ZONA 2") {
							tooltip.style.backgroundColor = 'rgba(255, 255, 102, 0.8)';  // Light yellow for Zone 2
						} else if (feature.properties.zonasi === "ZONA 3") {
							tooltip.style.backgroundColor = 'rgba(153, 255, 153, 0.8)';  // Light green for Zone 3
						}

						// Populate the tooltip with data from the GeoJSON
						document.getElementById("area-code").textContent =
							feature.properties.region_code;
						document.getElementById("area-name").textContent =
							feature.properties.region_name;
						document.getElementById("area-status").textContent =
							feature.properties.region_type;
						document.getElementById("level").textContent = feature.properties.level;
						document.getElementById("dapil-dprri").textContent =
							feature.properties.dapil_dpr_ri;
						document.getElementById("jml-pend").textContent =
							feature.properties.jml_pend;
						document.getElementById("jml-kk").textContent = feature.properties.jml_kk;
						document.getElementById("jml-dpt-2024").textContent =
							feature.properties.jml_dpt;
						document.getElementById("jml-cde").textContent =
							feature.properties.jml_cde;
						document.getElementById("jml-pemilih-kk").textContent =
							feature.properties.jml_dpt_perkk;
						document.getElementById("jml-pemilih-perempuan").textContent =
							feature.properties.jml_dpt_perempuan;
						document.getElementById("jml-pemilih-muda").textContent =
							feature.properties.jml_dpt_muda;
						document.getElementById("jml-tps").textContent =
							feature.properties.jml_tps;
						document.getElementById("zonasi").textContent = feature.properties.zonasi;

						if (feature.properties.level === 4) {
							document.getElementById("row-number-of-kel").style.display =
								"table-row";
							document.getElementById("number-of-kel").textContent =
								feature.properties.jml_kel;
							document.getElementById("row-number-of-desa").style.display =
								"table-row";
							document.getElementById("number-of-desa").textContent =
								feature.properties.jml_desa;
							document.getElementById("row-number-of-kec").style.display = "none";
						} else if (feature.properties.level === 5) {
							document.getElementById("row-number-of-kec").style.display = "none";
							document.getElementById("row-number-of-kel").style.display = "none";
							document.getElementById("row-number-of-desa").style.display = "none";
						}

						// Optional: Highlight the hovered province area
						e.target.setStyle({
							weight: 3,
							color: "#666",
							fillOpacity: 0.7,
						});
					});

					layer.on("mouseout", function (e) {
						// Hide the tooltip
						let tooltip = document.getElementById("databox-tooltip");
						tooltip.style.display = "none";

						// Reset style
						e.target.setStyle({
							weight: 1,
							color: "#3388ff",
							fillOpacity: 0.5,
						});
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

			// render tabular data
			fetchTableData(frm, currentLevel, code);

			if (locationLabel && locationLabel.getContainer()) {
				locationLabel.getContainer().innerHTML = `<h2>${parentName}</h2>`;
			}
		})
		.catch((error) => {
			console.error("Error fetching provinces:", error);
			map.setView(indonesiaDefaultView, 5); // Set default view on error
		});
}

function fetchCities(frm, map, code, provinceMarkers) {
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
			console.log("geojson city: ", geoJson);

			let parentName = "";
			cityLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
					// get region parent name
					parentName = feature.properties.parent_name;

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

			// render tabular data
			fetchTableData(frm, currentLevel, code);

			if (locationLabel && locationLabel.getContainer()) {
				locationLabel.getContainer().innerHTML = `<h2>${parentName}</h2>`;
			}
		})
		.catch((error) => console.error("Error fetching cities:", error));
}

function fetchTableData(frm, level, region) {
	const url = `polmark_dashboard.api.tabular.get_tabular_data?region=${region}`;
	frappe.call({
		method: url,
		args: {
			// any parameters you need to pass
		},
		callback: function (response) {
			if (response.message) {
				data = response.message;
				renderTable(frm, level, data);
			}
		},
	});
}
