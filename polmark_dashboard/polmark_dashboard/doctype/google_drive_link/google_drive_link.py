# Copyright (c) 2024, thinkspedia and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class GoogleDriveLink(Document):
	def get_query_param(param):
		return frappe.local.request.args.get(param)

	def get_list(self, *args, **kwargs):
		# Get filters from query string
		region_filter_value = self.get_query_param('region')

		# Apply custom filtering logic based on query string
		if region_filter_value:
			kwargs['filters'].append(['region', '=', region_filter_value])

		# Return the filtered list
		return super().get_list(*args, **kwargs)
