# Copyright (c) 2024, thinkspedia and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import csv
from io import StringIO


class Tabular(Document):
	def get_query_param(param):
		return frappe.local.request.args.get(param)
	
	# def get_data(doctype, kd_wilayah):
	# 	# Fetch data using get_list or get_all
	# 	data = frappe.db.get_list(doctype, fields=["*"], filters={'kode_kecamatan': kd_wilayah})
	# 	return data


@frappe.whitelist()
def get_data_from_doctype(doctype, kd_wilayah):
	# Get filters from query string
	# region_filter_value = self.get_query_param('region')

	# Fetch data from the given DocType
	data = frappe.db.get_list(doctype, fields=["*"], filters={'kode_kecamatan': kd_wilayah})
	# data = self.get_data(doctype, kd_wilayah)
	return data


@frappe.whitelist()
def export_data_to_csv(doctype, kd_wilayah):
	# Step 1: Get data
	data = frappe.db.get_list(doctype, fields=["*"], filters={'kode_kecamatan': kd_wilayah})

	# # Step 2: Define CSV output
	output = StringIO()
	writer = csv.writer(output)

	# # Step 3: Write headers (optional if you want field names in CSV)
	if data:
		writer.writerow(data[0].keys())  # Write column headers based on field names

	# # Step 4: Write rows
	for row in data:
		writer.writerow(row.values())

	# # Step 5: Get CSV content
	csv_content = output.getvalue()
	output.close()

	# # Step 6: Send CSV file as response
	frappe.local.response.filename = "exported_data.csv"
	frappe.local.response.filecontent = csv_content
	frappe.local.response.type = "csv"
	frappe.msgprint('Hello')
