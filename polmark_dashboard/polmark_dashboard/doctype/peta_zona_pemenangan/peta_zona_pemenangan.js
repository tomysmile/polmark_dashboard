// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

function getColor(d) {
	return d > (nilaiMax / 8) * 7
		? "#800026"
		: d > (nilaiMax / 8) * 6
		? "#BD0026"
		: d > (nilaiMax / 8) * 5
		? "#E31A1C"
		: d > (nilaiMax / 8) * 4
		? "#FC4E2A"
		: d > (nilaiMax / 8) * 3
		? "#FD8D3C"
		: d > (nilaiMax / 8) * 2
		? "#FEB24C"
		: d > (nilaiMax / 8) * 1
		? "#FED976"
		: "#FFEDA0";
}

function style(feature) {
	return {
		weight: 2,
		opacity: 1,
		color: "white",
		dashArray: "3",
		fillOpacity: 0.7,
		// fillColor : getColor(parseInt(feature.properties.nilai))
	};
}

function onEachFeature(feature, layer) {
	layer.bindPopup(
		"<h4>Jumlah Proyeksi Penduduk</h4><br>" +
			feature.properties.Propinsi +
			" : " +
			feature.properties.nilai +
			"(000) ribu jiwa"
	);
}

frappe.ui.form.on("Peta Zona Pemenangan", {
	refresh: function (frm) {
		//
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
		// Ensure that the map container exists only once
		if (!frm.map_initialized) {
			frm.map_initialized = true;

			// Create a div for the map if not existing
			if (!$("#mapid").length) {
				$('<div id="mapid" style="height: 500px;"></div>').appendTo(
					frm.fields_dict.map_html.wrapper
				);
			}

			var map = L.map("mapid").setView([-2.548926, 118.0148634], 5); // Coordinates of Indonesia, zoom level 5

			// Load OpenStreetMap tiles
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(map);

			// Fetch and load GeoJSON data
			fetch("/assets/polmark_dashboard/data/prov.geojson")
				.then((response) => response.json())
				.then((data) => {
					L.geoJSON(data, {
						style: style,
						onEachFeature: function (feature, layer) {
							layer.on("click", function () {
								alert("Clicked feature properties:");
								// var provinceId = feature.properties.id; // Assumes province ID is available
								// fetchCityGeoJSON(provinceId, map);
							});
						},
					}).addTo(map);
				})
				.catch((error) => console.error("Error loading GeoJSON:", error));
		}
	},
});
