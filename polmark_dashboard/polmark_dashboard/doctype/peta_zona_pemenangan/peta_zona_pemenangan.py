# Copyright (c) 2024, thinkspedia and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PetaZonaPemenangan(Document):
	def autoname(self):
		if self.slug:
			self.name = self.slug

	def validate(self):
		if frappe.db.exists("YourDoctypeName", self.slug):
			frappe.throw(f"A document with the slug '{self.slug}' already exists.")
