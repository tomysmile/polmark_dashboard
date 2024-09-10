# Copyright (c) 2024, thinkspedia and contributors
# For license information, please see license.txt

# import re
# import frappe
from frappe.model.document import Document


class DocumentCategory(Document):
    pass
    # def generate_slug(self, name):
    #     # Create a slug by converting the name to lowercase and replacing spaces with hyphens
    #     slug = re.sub(r'[^a-zA-Z0-9]', '-', name.lower()).strip('-')
    #     # Ensure slug is unique
    #     if frappe.db.exists('Document Category', {'slug': slug}):
    #         # If slug exists, append a number to make it unique
    #         counter = 1
    #         original_slug = slug
    #         while frappe.db.exists('Document Category', {'slug': slug}):
    #             slug = f"{original_slug}-{counter}"
    #             counter += 1
    #     return slug

    # def autoname(self):
    #     # Generate slug from a specific field, e.g., title
    #     if not self.slug:
    #         self.slug = self.generate_slug(self.category_name)
