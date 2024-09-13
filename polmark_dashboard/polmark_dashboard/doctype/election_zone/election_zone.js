// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Election Zone", {
	refresh: function(frm) {
    if (!frm.is_new()) {
        // If the document is already saved, show the specific field(s)
        frm.set_df_property('level', 'hidden', 0); // Show the field
    } else {
        // If it's a new document, hide the field(s)
        frm.set_df_property('level', 'hidden', 1); // Hide the field
    }
  }
});
