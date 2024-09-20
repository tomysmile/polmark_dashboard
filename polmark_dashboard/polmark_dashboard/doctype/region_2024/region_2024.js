// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Region 2024", {
	onload: function (frm) {
		$(document).ready(function () {
			if (!frm.is_new()) {
				// Hide the Save button
				frm.disable_save();

				// Iterate through all the fields in the form
				$.each(frm.fields_dict, function (fieldname, field) {
					// Set the field as read-only
					frm.set_df_property(fieldname, "read_only", 1);
				});

				// Initialize and render the map
				initializeMap(frm);
			}
		});
	},
	after_save: function (frm) {
		// Iterate through all the fields in the form
		$.each(frm.fields_dict, function (fieldname, field) {
			// Set the field as read-only
			frm.set_df_property(fieldname, "read_only", 1);
		});
		// Refresh the form to apply the changes
		frm.refresh();
	},
});
