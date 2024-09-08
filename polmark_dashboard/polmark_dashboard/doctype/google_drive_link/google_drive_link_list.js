function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

frappe.listview_settings['Google Drive Link'] = {
  onload: function(listview) {
    // Define the default sort order
  },
  formatters: {
    google_drive_url(val) {
      return `<a href="${val}" target="_blank">${val}</a>`;
    },
  }
};