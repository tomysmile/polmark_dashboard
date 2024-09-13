function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

frappe.listview_settings['Election Zone'] = {
  // hide_name_column: true
};