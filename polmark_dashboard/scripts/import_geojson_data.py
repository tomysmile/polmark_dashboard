import frappe

# import geojson
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
        data_source = item.get("data_source")
        jml_kecamatan = item.get("t_district")
        jml_kelurahan = item.get("t_sub_district_kelurahan")
        jml_desa = item.get("t_sub_district_desa")
        jml_tps = item.get("t_tps")
        geojson_str = json.dumps(item.get("feature"))

        # Extract the `properties` from the `feature` field
        properties = item.get("feature", {}).get("properties", {})
        region_name = properties.get("name")
        region_type = properties.get("type")
        region_code = properties.get("code")
        level = properties.get("level")
        color = properties.get("color")
        parent_name = properties.get("parent_name")
        parent_type = properties.get("parent_type")
        parent_code = properties.get("parent_code")
        dapil_dpr_ri = properties.get("dapil_dpr_ri")

        province = None
        kd_provinsi = None
        kokab = None
        kd_kokab = None
        kecamatan = None
        kd_kec = None
        kelurahan = None
        kd_kel = None

        # Extract region data
        # province
        if level == 2:
            province = properties.get("p_province_name")
            kd_provinsi = region_code
        # city
        elif level == 3:
            province = properties.get("p_province_name")
            kd_provinsi = region_code[:2]
            kokab = properties.get("p_city_name")
            kd_kokab = region_code

            if region_type == "Kabupaten":
                if "Kabupaten " not in region_name and "KAB. " not in region_name and "Kab. " not in region_name:
                    region_name = "KAB. " + region_name

        # kecamatan / district
        elif level == 4:
            province = properties.get("p_province_name")
            kd_provinsi = region_code[:2]
            kokab = properties.get("p_city_name")
            kd_kokab = region_code[:4]
            kecamatan = properties.get("p_district_name")
            kd_kec = region_code
        # kelurahan desa / subdistrict
        elif level == 5:
            province = properties.get("p_province_name")
            kd_provinsi = region_code[:2]
            kokab = properties.get("p_city_name")
            kd_kokab = region_code[:4]
            kecamatan = properties.get("p_district_name")
            kd_kec = region_code[:6]
            kelurahan = properties.get("p_sub_district_name")
            kd_kel = region_code

        jml_kk = properties.get("t_kk")
        jml_cde = properties.get("cde")
        jml_dpt_2024 = properties.get("t_pemilih")
        jml_dpt_perkk = properties.get("pemilih_per_kk")
        jml_dpt_perempuan = properties.get("t_pemilih_perempuan")
        jml_dpt_laki = properties.get("t_pemilih_laki")
        jml_dpt_muda = properties.get("t_pemilih_muda")
        jml_pend = properties.get("t_penduduk")
        zonasi = properties.get("zonasi")

        if parent_code:
            parent_code = parent_code
        else:
            if region_code and len(region_code) > 2:
                parent_code = region_code[:-2]
            else:
                parent_code = 1

        doc = frappe.get_doc(
            {
                "doctype": doctype,
                "region_code": region_code,
                "region_name": region_name,
                "region_type": region_type,
                "level": level,
                "data_source": data_source,
                "parent_code": parent_code,
                "parent_name": parent_name,
                "parent_type": parent_type,
                "dapil_dpr_ri": dapil_dpr_ri,
                "provinsi": province,
                "kd_provinsi": kd_provinsi,
                "kokab": kokab,
                "kd_kokab": kd_kokab,
                "kecamatan": kecamatan,
                "kd_kec": kd_kec,
                "kelurahan": kelurahan,
                "kd_kel": kd_kel,
                "geometry": geojson_str,
                "jml_kec": jml_kecamatan,
                "jml_kel": jml_kelurahan,
                "jml_desa": jml_desa,
                "jml_tps": jml_tps,
                "color": color,
                "jml_kk": jml_kk,
                "jml_cde": jml_cde,
                "jml_dpt": jml_dpt_2024,
                "jml_dpt_perkk": jml_dpt_perkk,
                "jml_dpt_perempuan": jml_dpt_perempuan,
                "jml_dpt_laki": jml_dpt_laki,
                "jml_dpt_muda": jml_dpt_muda,
                "jml_pend": jml_pend,
                "zonasi": zonasi,
                "standard": 1
            }
        )
        doc.insert()

    # Commit the transaction
    frappe.db.commit()


def import_province_data():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region_provinsi.json"
    )
    doctype = "Region 2024"

    # execute the function
    insert_to_database(doctype, file_path)
    print("GeoJSON Provinces data imported successfully!")


def import_city_of_jawabarat_data():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region_city_of_jawa_barat.json"
    )
    doctype = "Region 2024"

    # execute the function
    insert_to_database(doctype, file_path)
    print("GeoJSON City data imported successfully!")


def import_district_of_bekasi_data():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region_kec_bekasi.json"
    )
    doctype = "Region 2024"

    # execute the function
    insert_to_database(doctype, file_path)
    print("GeoJSON District data imported successfully!")


def import_subdistrict_of_bekasi_data():
    file_path = frappe.get_app_path(
        "polmark_dashboard", "public", "data", "region_keldesa_bekasi.json"
    )
    doctype = "Region 2024"

    # execute the function
    insert_to_database(doctype, file_path)
    print("GeoJSON Subdistrict data imported successfully!")
