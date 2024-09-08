// Copyright (c) 2024, thinkspedia and contributors
// For license information, please see license.txt

frappe.ui.form.on("News Link", {
	image: function(frm) {
    let image_url = frm.doc.headline_image;

    if(image_url) {
        // Show the image preview
        frm.fields_dict['image_preview'].$wrapper.html(`
            <img src="${image_url}" style="max-width: 400px; max-height: 400px;" />
        `);
    } else {
        // Clear the preview if no image is uploaded
        frm.fields_dict['image_preview'].$wrapper.empty();
    }
  },
  refresh: function(frm) {
      // Ensure the preview gets updated on form load
      frm.trigger('image');
  }
});
