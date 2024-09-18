import frappe
# import geojson
import json
import os


def import_properties_data():
    file_path = frappe.get_app_path('polmark_dashboard', 'public', 'data', 'region_province.json')

    # Check if the file exists
    if not os.path.exists(file_path):
        frappe.throw(f"File not found: {file_path}")

    # Custom Doctype name
    doctype = "Region Province"

    # Load the GeoJSON data from the file
    with open(file_path, "r") as json_file:
        # data = json.loads(json_file)
        file_content = json_file.read()

    # Parse the JSON data from the string
    data = json.loads(file_content)

    # Loop through each feature (province) in the GeoJSON
    for item in data:
        data_source = item["data_source"]
        jml_kecamatan = item["t_district"]
        jml_kelurahan = item["t_sub_district_kelurahan"]
        jml_desa = item["t_sub_district_desa"]
        jml_tps = item["t_tps"]
        geojson_str = json.dumps(item.get('feature'))

        # Extract the `properties` from the `feature` field
        properties = item.get("feature", {}).get("properties", {})
        province_name = properties.get("name")
        region_type = properties.get("type")
        region_code = properties.get("code")
        level = properties.get("level")
        parent_name = properties.get("parent_name")
        parent_type = properties.get("parent_type")
        color = properties.get("color")

        doc = frappe.get_doc({
            "doctype": doctype,
            "region_code": region_code,
            "region_name": province_name,
            "region_type": region_type,
            "level": level,
            "data_source": data_source,
            "parent_name": parent_name,
            "parent_type": parent_type,
            "geometry": geojson_str,
            "jml_kec": jml_kecamatan,
            "jml_kel": jml_kelurahan,
            "jml_desa": jml_desa,
            "jml_tps": jml_tps,
            "color": color
        })
        doc.insert()

    # Commit the transaction
    frappe.db.commit()
    print("GeoJSON Provinces data imported successfully!")
