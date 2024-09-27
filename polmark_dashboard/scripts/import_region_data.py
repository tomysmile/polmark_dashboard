import frappe
import json
import os


def insert_to_database(doctype, file_path):
    # Check if the file exists
    if not os.path.exists(file_path):
        frappe.throw(f"File not found: {file_path}")

    # Load the GeoJSON data from the file
    with open(file_path, "r") as json_file:
        # data = json.loads(json_file)
        file_content = json_file.read()

    # Parse the JSON data from the string
    data = json.loads(file_content)

    # Loop through each feature (province) in the GeoJSON
    for item in data:
        region_name = item.get("region_name")
        region_type = item.get("region_type")
        region_code = item.get("region_code")
        region_code_bps = item.get("region_code_bps")
        region_level = int(item.get("region_level"))
        parent_name = item.get("parent_name")
        parent_type = item.get("parent_type")
        parent_code = item.get("parent_code")
        parent_code_bps = item.get("parent_code_bps")
        parent_level = item.get("parent_level")
        if (parent_level is None or parent_level == "") and region_level > 1:
            parent_level = region_level - 1
        if parent_type == "Negara":
            parent_code = "1"
            parent_code_bps = "1"

        province_name = item.get("province_name")
        city_name = item.get("city_name")
        district_name = item.get("district_name")
        sub_district_name = item.get("sub_district_name")
        data_source = item.get("data_source")

        doc = frappe.get_doc(
            {
                "doctype": doctype,
                "region_name": region_name,
                "region_type": region_type,
                "region_code": region_code,
                "region_code_bps": region_code_bps,
                "region_level": region_level,
                "parent_name": parent_name,
                "parent_type": parent_type,
                "parent_code": parent_code,
                "parent_code_bps": parent_code_bps,
                "parent_level": parent_level,
                "province_name": province_name,
                "city_name": city_name,
                "district_name": district_name,
                "sub_district_name": sub_district_name,
                "data_source": data_source,
                "standard": 1
            }
        )
        doc.insert()

    # Commit the transaction
    frappe.db.commit()


def import_region_province_all():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.province_all.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")

# SUMUT


def import_region_kokab_sumut():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.kokab_sumut.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def import_region_kec_sumut():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.kecamatan_sumut.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def import_region_desakel_sumut():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.desakel_sumut.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


# JABAR

def import_region_kokab_jabar():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.kokab_jabar.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def import_region_kec_jabar():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.kecamatan_jabar.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def import_region_desakel_jabar():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region.desakel_jabar.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")
