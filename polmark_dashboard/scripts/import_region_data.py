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
        if region_name:
            region_name = remove_region_type(region_name)
        region_type = item.get("region_type")
        region_code = item.get("region_code")
        region_level = int(item.get("region_level"))
        region_fullname = join_with_space_uppercase_first(region_type, region_name)
        data_source = item.get("data_source")
        parent_name = item.get("parent_name")
        parent_type = item.get("parent_type")
        parent_code = item.get("parent_code")
        if parent_type == "Negara":
            parent_code = "1"
        parent_level = int(item.get("parent_level"))
        province_name = item.get("province_name")
        city_name = item.get("city_name")
        if city_name:
            city_name = remove_region_type(city_name)
        district_name = item.get("district_name")
        if district_name:
            district_name = remove_region_type(district_name)
        sub_district_name = item.get("sub_district_name")
        if sub_district_name:
            sub_district_name = remove_region_type(sub_district_name)
        doc = frappe.get_doc(
            {
                "doctype": doctype,
                "region_name": region_name,
                "region_type": region_type,
                "region_code": region_code,
                "region_level": region_level,
                "region_fullname": region_fullname,
                "parent_name": parent_name,
                "parent_type": parent_type,
                "parent_code": parent_code,
                "parent_level": parent_level,
                "province_name": province_name,
                "city_name": city_name,
                "district_name": district_name,
                "sub_district_name": sub_district_name,
                "data_source": data_source,
                "standard": 1,
            }
        )
        doc.insert()

    # Commit the transaction
    frappe.db.commit()


def remove_region_type(region_name):
    # Check if city_name is a string and not empty
    if isinstance(region_name, str) and region_name.strip():
        words = region_name.split()
        # Check if the first word is "KOTA" or "KABUPATEN" (case-insensitive)
        if words[0].upper() in [
            "PROVINSI",
            "KOTA",
            "KABUPATEN",
            "KECAMATAN",
            "KELURAHAN",
            "DESA",
        ]:
            words = words[1:]  # Remove the first word
        # Join the words and strip any extra leading or trailing spaces
        return " ".join(words).strip()
    return region_name.strip()


def join_with_space_uppercase_first(word1, word2):
    # Ensure the first word is uppercase and join with the second word
    if isinstance(word1, str) and isinstance(word2, str):
        # Make the first word uppercase and join with one space between the two words
        return f"{word1.strip().upper()} {word2.strip()}"
    return ""


def region_all():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region_all.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def region_province_all():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region_provinsi_all.json"
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def region_kokab_all():
    file_path = frappe.get_app_path(
        "polmark_dashboard",
        "public",
        "data",
        "region_kokab_DKI_JABAR_KALTENG_KALTIM_SUMUT.json",
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def region_kec_all():
    file_path = frappe.get_app_path(
        "polmark_dashboard",
        "public",
        "data",
        "region_kecamatan_DKI_JABAR_KALTENG_KALTIM_SUMUT.json",
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")


def region_desa_all():
    file_path = frappe.get_app_path(
        "polmark_dashboard",
        "public",
        "data",
        "region_desa_DKI_JABAR_KALTENG_KALTIM_SUMUT.json",
    )
    doctype = "Region"

    # execute the function
    insert_to_database(doctype, file_path)
    print("Region data imported successfully!")
