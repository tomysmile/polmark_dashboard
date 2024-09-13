// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Dapil DPR RI", {
	refresh(frm) {
    //
	},
  onload: function(frm) {
    frm.set_query("region", function() {
      return {
          "filters": {
              "level": 2 // Level Provinsi
          }
      };
    });
    frm.set_query("region", "cities", function() {
      return {
          "filters": {
              "parent_code": frm.doc.region
          }
      };
    });
  }
});
