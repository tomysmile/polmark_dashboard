// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Peta Zona Pemenangan", {
	refresh(frm) {
		frm.set_df_property("map_html", "hidden", frm.is_new() ? 1 : 0);
	},
	title(frm) {
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
		$(document).ready(() => {
			if (!frm.is_new()) {
				frm.disable_save();
				setTimeout(() => initializeLeafletMap(frm), 0);
			}
		});
	},
});

const indonesiaDefaultView = [-2.5489, 118.0149];

let provinceMarkers = [],
	cityMarkers = [],
	districtMarkers = [];
let provinceLayer = null,
	cityLayer = null,
	districtLayer = null;
let currentLevel = 0;
let provinceDefaultView = [],
	cityDefaultView = [];
let locationLabel;

function initializeLeafletMap(frm) {
	const mapWrapper = frm.fields_dict["map_html"]?.$wrapper;
	if (!mapWrapper) {
		console.error("Map container not found.");
		return;
	}

	// Set up the map inside the Doctype form
	const dataTooltipArea = createDataTooltip();

	mapWrapper.html(`
		<div id="map-container" style="position: relative;">
			<div id="leaflet-map" style="height: 80vh;">
				${dataTooltipArea}
			</div>
		</div>
  	`);

	// Initialize Leaflet map
	const map = L.map("leaflet-map").setView(indonesiaDefaultView, 5);

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap contributors",
	}).addTo(map);

	const { region, level_code, region_type, region_name } = frm.doc;

	addFullScreenControl(map);
	addBackButton(map, frm, region);
	addLegend(map);
	addMapTitleLabel(map, `${region_type} ${region_name}`);

	// Initial load of map
	if (level_code === "3") {
		fetchProvinces(frm, map, region, provinceMarkers);
	}
}

function addFullScreenControl(map) {
	map.addControl(new L.Control.Fullscreen());
	map.on("enterFullscreen", () => console.log("Entered fullscreen mode"));
	map.on("exitFullscreen", () => console.log("Exited fullscreen mode"));
}

function addMapTitleLabel(map, name) {
	locationLabel = L.control({ position: "topcenter" });
	locationLabel.onAdd = function (map) {
		let div = L.DomUtil.create("div", "location-label-container");
		div.innerHTML = `<span class="map-title">${name}</span>`;
		return div;
	};
	locationLabel.addTo(map);
}

function setLocationLabel(name) {
	if (locationLabel && locationLabel.getContainer()) {
		locationLabel.getContainer().innerHTML = `<span class="map-title">${name}</span>`;
	}
}

function addBackButton(map, frm, region) {
	const backButton = L.control({ position: "topleft" });
	backButton.onAdd = () => {
		const div = L.DomUtil.create("div", "back-button");
		div.innerHTML = '<button type="button">Back</button>';
		div.style.display = "none";
		div.onclick = () => {
			fetchProvinces(frm, map, region, provinceMarkers);
			map.setView(provinceDefaultView, 5);
			div.style.display = "none";
		};
		return div;
	};
	backButton.addTo(map);
}

function createDataTooltip() {
	return `<div id="databox-tooltip" style="position:absolute; bottom:25px; right:18px; padding:10px; background-color:white; border:1px solid #ccc; display:none; z-index:1000;">
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
	</div>`;
}

function getColor(zone) {
	const colors = {
		"ZONA 1": "#ff9999",
		"ZONA 2": "#ffff99",
		"ZONA 3": "#99ff99",
	};
	return colors[zone] || "#ffffff";
}

function applyStyle(feature) {
	return {
		fillColor: getColor(feature.properties.zonasi),
		weight: 2,
		opacity: 1,
		color: "white",
		fillOpacity: 0.7,
	};
}

// Function to calculate the centroid for a Polygon (in case some features are Polygons)
function getCentroid(coordinates) {
	let totalLat = 0,
		totalLng = 0,
		totalPoints = 0;
	coordinates[0].forEach(([lng, lat]) => {
		totalLng += lng;
		totalLat += lat;
		totalPoints++;
	});
	return totalPoints ? [totalLat / totalPoints, totalLng / totalPoints] : null;
}

function getMultiPolygonCentroid(coordinates) {
	let totalLat = 0,
		totalLng = 0,
		totalPoints = 0;
	coordinates.forEach((polygon) => {
		polygon[0].forEach(([lng, lat]) => {
			totalLng += lng;
			totalLat += lat;
			totalPoints++;
		});
	});
	return totalPoints ? [totalLat / totalPoints, totalLng / totalPoints] : null;
}

function showLabelMarker(map, feature) {
	const centroid =
		feature.geometry.type === "MultiPolygon"
			? getMultiPolygonCentroid(feature.geometry.coordinates)
			: getCentroid(feature.geometry.coordinates);

	if (centroid) {
		const markerLabel = L.divIcon({
			className: "province-label",
			html: `<div class="peta-label-content"><span class="peta-label-text">${feature.properties.name}</span></div>`,
		});
		L.marker(centroid, { icon: markerLabel }).addTo(map);
	} else {
		console.error("Invalid centroid for feature:", feature.properties.name);
	}
}

function showDataTooltip(data) {
	document.getElementById("area-code").textContent = data.region_code;
	document.getElementById("area-name").textContent = data.region_name;
	document.getElementById("area-status").textContent = data.region_type;
	document.getElementById("level").textContent = data.level;
	document.getElementById("dapil-dprri").textContent = data.dapil_dpr_ri;
	document.getElementById("jml-pend").textContent = data.jml_pend;
	document.getElementById("jml-kk").textContent = data.jml_kk;
	document.getElementById("jml-dpt-2024").textContent = data.jml_dpt;
	document.getElementById("jml-cde").textContent = data.jml_cde;
	document.getElementById("jml-pemilih-kk").textContent = data.jml_dpt_perkk;
	document.getElementById("jml-pemilih-perempuan").textContent = data.jml_dpt_perempuan;
	document.getElementById("jml-pemilih-muda").textContent = data.jml_dpt_muda;
	document.getElementById("jml-tps").textContent = data.jml_tps;
	document.getElementById("zonasi").textContent = data.zonasi;

	if (data.level === 4) {
		document.getElementById("row-number-of-kel").style.display = "table-row";
		document.getElementById("number-of-kel").textContent = data.jml_kel;
		document.getElementById("row-number-of-desa").style.display = "table-row";
		document.getElementById("number-of-desa").textContent = data.jml_desa;
		document.getElementById("row-number-of-kec").style.display = "none";
	} else if (data.level === 5) {
		document.getElementById("row-number-of-kec").style.display = "none";
		document.getElementById("row-number-of-kel").style.display = "none";
		document.getElementById("row-number-of-desa").style.display = "none";
	}
}

// Function to add the legend control to the map
function addLegend(map) {
	const legend = L.control({ position: "bottomleft" });
	legend.onAdd = () => {
		const div = L.DomUtil.create("div", "info legend");
		const zones = ["ZONA 1", "ZONA 2", "ZONA 3"];
		div.innerHTML = zones
			.map((zone) => `<i style="background:${getColor(zone)}"></i> ${zone}`)
			.join("<br>");
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
			callback(r) {
				r.message ? resolve(r.message) : reject("No data found");
			},
			error: reject,
		});
	});
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

function fetchProvinces(frm, map, code, provinceMarkers) {
	cityMarkers.forEach((marker) => map.removeLayer(marker));
	cityMarkers = [];
	map.eachLayer((layer) => {
		if (layer instanceof L.GeoJSON) map.removeLayer(layer);
	});

	currentLevel = 3;
	const url = `polmark_dashboard.api.geojson.get_geojson_data?region=${code}`;

	fetchGeoJsonData(url)
		.then((geoJson) => {
			if (!geoJson || geoJson.features.length === 0) {
				console.error("No valid province data found");
				map.setView(indonesiaDefaultView, 5);
				return;
			}

			// console.log("geojson province: ", geoJson);

			let parentName = "";
			let parentType = "";

			provinceLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
					parentName = feature.properties.parent_name;
					parentType = feature.properties.parent_type;

					// Store province markers and icons in an array
					const marker = L.marker(layer.getBounds().getCenter(), {
						icon: L.divIcon({
							className: "province-label",
							html: `<div class="peta-label-content"><span class="peta-label-text">${feature.properties.name}</span></div>`,
						}),
					}).addTo(map);

					// Add marker to the array
					provinceMarkers.push(marker);

					layer.on("click", () => {
						document.getElementById("databox-tooltip").style.display = "none";
						fetchCities(frm, map, feature.properties.region_code, provinceMarkers);
					});

					layer.on("mouseover", function (e) {
						// Show the tooltip
						let tooltip = document.getElementById("databox-tooltip");
						tooltip.style.display = "block";

						// Populate the tooltip with data from the GeoJSON
						showDataTooltip(feature.properties);

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

			setLocationLabel(`${parentType} ${parentName}`);
		})
		.catch((error) => {
			console.error("Error fetching provinces:", error);
			map.setView(indonesiaDefaultView, 5); // Set default view on error
		});
}

function fetchCities(frm, map, code, provinceMarkers) {
	provinceMarkers.forEach((marker) => map.removeLayer(marker));
	provinceMarkers = [];
	map.eachLayer((layer) => {
		if (layer instanceof L.GeoJSON) map.removeLayer(layer);
	});

	currentLevel = 4;
	const url = `polmark_dashboard.api.geojson.get_geojson_data?region=${code}`;

	fetchGeoJsonData(url)
		.then((geoJson) => {
			if (!geoJson || geoJson.features.length === 0) {
				console.error("No valid city data found");
				map.setView(provinceDefaultView, 5);
				return;
			}

			// console.log("geojson city: ", geoJson);

			let parentName = "";
			let parentType = "";

			cityLayer = L.geoJSON(geoJson, {
				style: applyStyle,
				onEachFeature: function (feature, layer) {
					parentName = feature.properties.parent_name;
					parentType = feature.properties.parent_type;

					const marker = L.marker(layer.getBounds().getCenter(), {
						icon: L.divIcon({
							className: "city-label",
							html: `<div class="peta-label-content"><span class="peta-label-text">${feature.properties.name}</span></div>`,
						}),
					}).addTo(map);

					// Add marker to the array
					cityMarkers.push(marker);

					layer.on("click", () => {
						document.getElementById("databox-tooltip").style.display = "none";
					});

					layer.on("mouseover", function (e) {
						// Show the tooltip
						let tooltip = document.getElementById("databox-tooltip");
						tooltip.style.display = "block";

						// Populate the tooltip with data from the GeoJSON
						showDataTooltip(feature.properties);

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

			map.fitBounds(cityLayer.getBounds());
			document.querySelector(".back-button").style.display = "block"; // Show back button

			cityDefaultView = map.getCenter();

			fetchTableData(frm, currentLevel, code);
			setLocationLabel(`${parentType} ${parentName}`);
		})
		.catch((error) => console.error("Error fetching cities:", error));
}
