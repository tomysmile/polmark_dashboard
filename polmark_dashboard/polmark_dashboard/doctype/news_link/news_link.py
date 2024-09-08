# Copyright (c) 2024, thinkspedia and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class NewsLink(Document):
	def get_list(self, *args, **kwargs):
		# Get filters from query string
		zone_category_code_filter_value = self.get_query_param('zone_category_code')

		# Apply custom filtering logic based on query string
		if zone_category_code_filter_value:
			kwargs['filters'].append(['zone_category_code', '=', zone_category_code_filter_value])

		# Return the filtered list
		return super().get_list(*args, **kwargs)
