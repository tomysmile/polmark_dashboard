import frappe


@frappe.whitelist(allow_guest=True)
def get_tabular_data(region=None, region_code=None, region_level=None):
    # Fetch GeoJSON data based on the region (province, city, etc.)
    filters = {}
    if int(region_level) == 3:
        filters = {"province_code": region_code, "region_level": region_level}
    elif int(region_level) > 3:
        filters = {"parent_code": region_code, "region_level": region_level}
    regiontable = "Geojson" + " " + region
    regions = frappe.get_all(regiontable, filters=filters, fields=["*"])

    fields = [
        "name",
        "region_code",
        "region_code_bps",
        "region_name",
        "region_type",
        "region_level",
        "region_fullname",
        "parent_code",
        "parent_code_bps",
        "parent_name",
        "parent_type",
        "parent_level",
        "data_source",
        "dapil_dpr_ri",
        "province_name",
        "province_code",
        "province_code_bps",
        "city_name",
        "city_code",
        "city_code_bps",
        "district_name",
        "district_code",
        "district_code_bps",
        "sub_district_name",
        "sub_district_code",
        "sub_district_code_bps",
        "num_district",
        "num_sub_district_kelurahan",
        "num_sub_district_desa",
        "num_tps",
        "num_citizen",
        "num_cde",
        "num_voter",
        "num_family",
        "num_voter_per_family",
        "num_voter_women",
        "num_voter_young",
        "num_voter_men",
        "num_voter_dpthp2",
        "num_voter_per_family_dpthp2",
        "num_voter_women_dpthp2",
        "num_voter_young_dpthp2",
        "num_voter_men_dpthp2",
        "target_voter",
        "visited_voter",
        "percentage_target_voter",
        "target_visited_kk",
        "volunteer",
        "zone",
        "province_zone",
        "city_zone",
        "district_zone",
        "sub_district_zone",
        "color",
    ]

    regiontable = "Geojson" + " " + region
    regions = frappe.get_all(regiontable, filters=filters, fields=fields)
    return regions
