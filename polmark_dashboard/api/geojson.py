import frappe
import json


def build_geojson(data):
    # Build the GeoJSON structure
    geojson = {"type": "FeatureCollection", "features": []}

    for region in data:
        # Convert 'geometry' field from string to JSON (if needed)
        geometry_full_data = json.loads(region.get("geometry", "{}"))

        # Build each feature
        feature = {
            "type": "Feature",
            "properties": {
                "name": region.get("region_name"),
                "region_name": region.get("region_name"),
                "region_code": region.get("region_code"),
                "region_type": region.get("region_type"),
                "level": region.get("level"),
                "parent_code": region.get("parent_code"),
                "parent_name": region.get("parent_name"),
                "parent_type": region.get("parent_type"),
                "data_source": region.get("data_source"),
                "dapil_dpr_ri": region.get("dapil_dpr_ri"),
                "color": region.get("color"),
                "jml_kec": region.get("jml_kec"),
                "jml_kel": region.get("jml_kel"),
                "jml_desa": region.get("jml_desa"),
                "jml_tps": region.get("jml_tps"),
                "jml_kk": region.get("jml_kk"),
                "jml_dpt_2024": region.get("jml_dpt_2024"),
                "jml_dpt_perkk": region.get("jml_dpt_perkk"),
                "jml_dpt_perempuan": region.get("jml_dpt_perempuan"),
                "jml_dpt_laki": region.get("jml_dpt_laki"),
                "jml_dpt_muda": region.get("jml_dpt_muda"),
                "jumlah_cde": region.get("jumlah_cde"),
                "jml_pend": region.get("jml_pend"),
                "zonasi": region.get("zonasi"),
                "jml_pend_2020": region.get("jml_pend_2020"),
                "luas_km2": region.get("luas_km2"),
            },
            "geometry": geometry_full_data.get("geometry"),
        }

        # Add feature to the features list
        geojson["features"].append(feature)
    return geojson


@frappe.whitelist(allow_guest=True)
def get_provinces(province_id=None, parent_id=None):
    filters = []

    if province_id:
        filters.append(["region_code", "=", province_id])
    if parent_id:
        filters.append(["parent_code", "=", parent_id])

    # Retrieve province data from your Doctype
    regions = frappe.get_all(
        "Region Province", filters=filters if filters else None, fields=["*"]
    )
    geojson = build_geojson(regions)
    return geojson


@frappe.whitelist(allow_guest=True)
def get_cities(province_id):
    # Query for cities based on province_id
    regions = frappe.get_all(
        "Region City", filters={"parent_code": province_id}, fields=["*"]
    )
    geojson = build_geojson(regions)
    return geojson


@frappe.whitelist(allow_guest=True)
def get_districts(city_id):
    # Query for districts based on city_id
    regions = frappe.get_all(
        "Region District", filters={"parent_code": city_id}, fields=["*"]
    )
    geojson = build_geojson(regions)
    return geojson


@frappe.whitelist(allow_guest=True)
def get_subdistricts(district_id):
    # Query for districts based on city_id
    regions = frappe.get_all(
        "Region Subdistrict", filters={"parent_code": district_id}, fields=["*"]
    )
    geojson = build_geojson(regions)
    return geojson
