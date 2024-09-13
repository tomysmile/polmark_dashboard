// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("Tabular", {
	refresh(frm) {

    // if (frm.fields_dict.custom_html_field) {
    //   // Add an export button
    //   if (!frm.custom_buttons['Export CSV']) {
    //       frm.add_custom_button(__('Export CSV'), function() {
    //           exportToCSV($('#datatable-container'));
    //       });
    //   }
    // }

    // frm.add_custom_button(__('Print'), function(){
    //   frappe.msgprint("Helloooo..");
    // }, __("Utilities"));

    // frm.add_custom_button(__('Export to CSV'), function(){
    //   frappe.msgprint("Helloooo..");
    // }, __("Utilities"));

    // frappe.call({
    //   method: 'polmark_dashboard.polmark_dashboard.doctype.tabular.tabular.render_template',
    //   args: { 'docname': frm.doc.name },
    //   callback: function(r) {
    //       if (r.message) {
    //           frm.fields_dict.custom_html_field.$wrapper.html(r.message);
    //       }
    //   }
    // });

    let query_string = window.location.search;

    // Parse the query string to get individual parameters
    let query_params = new URLSearchParams(query_string);

    // Retrieve a specific query parameter value
    let kd_wilayah = query_params.get('kd_wilayah');

    console.log(kd_wilayah); // Output the value of the query parameter

    if (!frm.is_new()) {
      $('.btn-default').addClass("hide");
      // Hide the save button if the document is already saved
      frm.disable_save();
      // frappe.set_route('List', 'Tabular', 'Report');

      frm.add_custom_button(__('Export to CSV'), function() {
        // Call server-side method
        frappe.call({
            method: 'polmark_dashboard.polmark_dashboard.doctype.tabular.tabular.export_data_to_csv',
            args: {
              doctype: "Tabular Pilkada Item Bekasi",
              kd_wilayah: kd_wilayah
            },
            callback: function(r) {
                if (r.message) {
                    // Handle success if necessary
                }
            }
        });
      });
    }

    // Fetch data using frappe.call (calling server-side Python method)
    frappe.call({
      method: "polmark_dashboard.polmark_dashboard.doctype.tabular.tabular.get_data_from_doctype", // Server-side method to get data
      args: {
          doctype: "Tabular Pilkada Item Bekasi",
          kd_wilayah: kd_wilayah
      },
      callback: function(response) {
          let data = response.message;

          // Define columns for the DataTable (based on DocType fields)
          let columns = [
              // { id: 'kode_provinsi', name: 'Kode Provinsi', editable: false },
              // { id: 'provinsi', name: 'Provinsi', editable: false },
              // { id: 'dapil_dprri', name: 'Dapil DPR RI', editable: false },
              // { id: 'kode_kabkota', name: 'Kode Kab/Kota', editable: false },
              // { id: 'kabkota', name: 'Kab/Kota', editable: false },
              // { id: 'kode_kecamatan', name: 'Kode Kecamatan', editable: false },
              // { id: 'kecamatan', name: 'Kecamatan', editable: false },
              // { id: 'kode_keldesa', name: 'Kd Kel/Desa', editable: false },
              { id: 'kelurahan_desa', name: 'Nama', editable: false, width: 2 },
              // { id: 'status_pemerintahan', name: 'Status', editable: false },
              { id: 'level', name: 'Level', editable: false },
              { id: 'jumlah_penduduk', name: 'Penduduk', editable: false },
              { id: 'jumlah_kk', name: 'KK', editable: false },
              { id: 'jumlah_pemilih_pemilu_2024', name: 'DPT', editable: false },
              { id: 'jumlah_cde', name: 'CDE', editable: false },
              { id: 'ratarata_pemilih_kk', name: 'RAK', editable: false },
              { id: 'jumlah_pemilih_perempuan', name: 'Perempuan', editable: false },
              { id: 'jumlah_pemilih_muda', name: 'Muda', editable: false },
              { id: 'zonasi', name: 'Zonasi', editable: false }
          ];

          // Prepare rows for the DataTable
          let rows = data.map(row => [
              // row.kode_provinsi,
              // row.provinsi,
              // row.dapil_dprri,
              // row.kode_kabkota,
              // row.kabkota,
              // row.kode_kecamatan,
              // row.kecamatan,
              // row.kode_keldesa,
              row.status_pemerintahan + ' ' + row.kelurahan_desa,
              // row.status_pemerintahan,
              row.level,
              row.jumlah_penduduk,
              row.jumlah_kk,
              row.jumlah_pemilih_pemilu_2024,
              row.jumlah_cde,
              parseFloat(row.ratarata_pemilih_kk).toFixed(2),
              row.jumlah_pemilih_perempuan,
              row.jumlah_pemilih_muda,
              row.zonasi
          ]);

          // Initialize the DataTable and populate it with data
          let datatable = new DataTable("#datatable-container", {
              columns: columns,
              data: rows,
              showExport: true,
              inlineFilters: false, // Enable filters
              layout: 'ratio',     // Optional, adjust to container
              noDataMessage: "No records found"
          });

          console.log(datatable);
      }
    });
	},
});

// Function to export datatable as CSV
function exportToCSV(datatable) {
  let rows = [];

  // Collect headers
  let headers = datatable.columns.map(col => col.content);
  rows.push(headers);

  // Collect data rows
  datatable.data.forEach(row => {
      let dataRow = [];
      datatable.columns.forEach(col => {
          dataRow.push(row[col.fieldname]);  // Fetch data based on fieldname
      });
      rows.push(dataRow);
  });

  // Convert to CSV and trigger download
  frappe.utils.csv_to_output(rows);
}
