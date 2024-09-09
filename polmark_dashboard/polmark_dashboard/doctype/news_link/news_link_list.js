function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

frappe.listview_settings['News Link'] = {
  hide_name_column: true, // hide the last column which shows the `name`
  onload: function(listview) {
    // Define the default sort order
    listview.sort_by = 'posted_date';   // Replace with your field
    listview.sort_order = 'asc';       // 'asc' for ascending, 'desc' for descending
  },
  formatters: {
    source_url(val) {
      return `<a href="${val}" target="_blank">${val}</a>`;
    },
  }
};