function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

frappe.listview_settings['News Link'] = {
  onload: function(listview) {
    // Define the default sort order
    listview.sort_by = 'posted_date';   // Replace with your field
    listview.sort_order = 'asc';       // 'asc' for ascending, 'desc' for descending
  }
};