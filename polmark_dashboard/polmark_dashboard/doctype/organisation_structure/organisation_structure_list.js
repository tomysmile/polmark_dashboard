frappe.listview_settings["Organisation Structure"] = {
  add_fields: ['full_name', 'phone_number', 'position'],
  hide_name_column: true, // hide the last column which shows the `name`
  formatters: {
    phone_number(val) {
      return `<a href="tel:${val}">${val}</a>`;
    },
  }
};
