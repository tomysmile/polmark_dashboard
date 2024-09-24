app_name = "polmark_dashboard"
app_title = "Polmark Dashboard"
app_publisher = "thinkspedia"
app_description = "Polmark Dashboard"
app_email = "tomysmile@gmail.com"
app_license = "mit"
# required_apps = []

# Define the API route
doc_events = {
    "*": {
        "get_provinces": "polmark_dashboard.api.geojson.get_provinces",
    }
}

fixtures = [
    {
        "doctype": "Role",
        "filters": [
            ["name", "in", ["Polmark Dashboard Manager", "Polmark Dashboard User"]]
        ],
    },
    {
        "doctype": "Role Profile",
        "filters": [
            ["name", "in", ["Polmark Dashboard Manager", "Polmark Dashboard User"]]
        ],
    },
    {"doctype": "Workspace"},
    {"doctype": "Custom HTML Block"},
    {"doctype": "Region", "filters": [["standard", "=", 1]]},
    {"doctype": "Region Type", "filters": [["standard", "=", 1]]},
    {"doctype": "Region 2024", "filters": [["standard", "=", 1]]},
    {"doctype": "Dapil Category", "filters": [["standard", "=", 1]]},
    {"doctype": "Dapil DPR RI", "filters": [["standard", "=", 1]]},
    {"doctype": "Dapil DPR RI City"},
    {"doctype": "Document Category", "filters": [["standard", "=", 1]]},
    {"doctype": "Election Organisation", "filters": [["standard", "=", 1]]},
    {"doctype": "News Site", "filters": [["standard", "=", 1]]},
    {"doctype": "Organisation Structure Position", "filters": [["standard", "=", 1]]},
    {"doctype": "Zona Pemenangan", "filters": [["standard", "=", 1]]},
    {"doctype": "Peta Zona Pemenangan", "filters": [["standard", "=", 1]]}
]


# Includes in <head>
# ------------------

app_include_css = [
    "polmark_dashboard.bundle.css",
    "/assets/polmark_dashboard/css/leaflet.fullscreen/leaflet.fullscreen.css",
]

app_include_js = [
    "/assets/polmark_dashboard/js/patch-leaflet.js",
    "/assets/polmark_dashboard/js/Leaflet.fullscreen.min.js"
]

# include js, css files in header of desk.html
# app_include_css = "/assets/polmark_dashboard/css/polmark_dashboard.css"
# app_include_js = "/assets/polmark_dashboard/js/polmark_dashboard.js"

# include js, css files in header of web template
# web_include_css = "/assets/polmark_dashboard/css/polmark_dashboard.css"
# web_include_js = "/assets/polmark_dashboard/js/polmark_dashboard.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "polmark_dashboard/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "polmark_dashboard/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "polmark_dashboard.utils.jinja_methods",
# 	"filters": "polmark_dashboard.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "polmark_dashboard.install.before_install"
# after_install = "polmark_dashboard.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "polmark_dashboard.uninstall.before_uninstall"
# after_uninstall = "polmark_dashboard.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "polmark_dashboard.utils.before_app_install"
# after_app_install = "polmark_dashboard.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "polmark_dashboard.utils.before_app_uninstall"
# after_app_uninstall = "polmark_dashboard.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "polmark_dashboard.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"polmark_dashboard.tasks.all"
# 	],
# 	"daily": [
# 		"polmark_dashboard.tasks.daily"
# 	],
# 	"hourly": [
# 		"polmark_dashboard.tasks.hourly"
# 	],
# 	"weekly": [
# 		"polmark_dashboard.tasks.weekly"
# 	],
# 	"monthly": [
# 		"polmark_dashboard.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "polmark_dashboard.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "polmark_dashboard.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "polmark_dashboard.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["polmark_dashboard.utils.before_request"]
# after_request = ["polmark_dashboard.utils.after_request"]

# Job Events
# ----------
# before_job = ["polmark_dashboard.utils.before_job"]
# after_job = ["polmark_dashboard.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"polmark_dashboard.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }
