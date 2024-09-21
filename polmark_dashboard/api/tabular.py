import frappe


@frappe.whitelist(allow_guest=True)
def get_tabular_data(region=None):
    # Fetch GeoJSON data based on the region (province, city, etc.)
    filters = {}

    if region:
        filters = {"parent_code": region}
    else:
        filters = {"parent_code": "1"}  # show indonesia map

    fields = [
        "name",
        "region_code",
        "region_name",
        "region_type",
        "level",
        "parent_code",
        "parent_name",
        "parent_type",
        "data_source",
        "dapil_dpr_ri",
        "provinsi",
        "kd_provinsi",
        "kokab",
        "kd_kokab",
        "kecamatan",
        "kd_kec",
        "kelurahan",
        "kd_kel",
        "jml_kec",
        "jml_kel",
        "jml_desa",
        "jml_tps",
        "jml_pend",
        "jml_cde",
        "jml_dpt",
        "jml_kk",
        "jml_dpt_perkk",
        "jml_dpt_perempuan",
        "jml_dpt_muda",
        "jml_dpt_laki",
        "zonasi",
        "jml_pend_2020",
        "luas_km2",
        "color",
    ]

    regions = frappe.get_all("Region 2024", filters=filters, fields=fields)
    return regions
