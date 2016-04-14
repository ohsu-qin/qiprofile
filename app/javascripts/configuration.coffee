# Application configuration module.
#
# TODO - implement in beta. Read in an external JSON config
#   and use in the app to replace string and number constants.
#
# Example _public/conf/qiprofile.json:
# {
#   "subject": {
#      "label": "Patient"
#    },
#   "session": {
#      "label": "Visit"
#    }
# }
angular.module('qiprofile.config', [])
