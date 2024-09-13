// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Region", {
	refresh(frm) {
    // 
	},
  onload: function(frm) {
    frm.fields_dict['name'].df.options = 'Your custom prompt message';
  }
});
