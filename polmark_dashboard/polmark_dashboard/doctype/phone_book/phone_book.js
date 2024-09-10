// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Phone Book", {
	refresh(frm) {
    frm.fields_dict['phone_number'].input.addEventListener('input', function(e) {
      let value = e.target.value;
      
      // Allow only numeric characters and the plus sign
      let validValue = value.replace(/[^0-9+]/g, '');
      
      // Update the field value
      e.target.value = validValue;
    });
	},
  onload: function(frm) {
    // Get the URL
    let url = window.location.href;
    
    // Use URLSearchParams to parse the query string
    let params = new URLSearchParams(window.location.search);

    // Check if a specific query parameter exists
    if (params.has('region')) {
        // Get the value from the query string
        let query_value = params.get('region');
        
        // Set the value in the form field (replace 'field_name_in_form' with your field name)
        frm.set_value('region', query_value);
    }
  },
  validate: function(frm) {
    // Get the phone number field value
    let phone_number = frm.doc.phone_number;

    // Define the regex pattern for Indonesian phone numbers
    let indonesianPhonePattern = /^(?:\+62|0)[2-9]{1}[0-9]{8,10}$/;

    // Check if the phone number matches the regex
    if (!indonesianPhonePattern.test(phone_number)) {
        frappe.msgprint(__('Please enter a valid Indonesian phone number.'));
        frappe.validated = false;  // Stop form submission
    }
  }
});
