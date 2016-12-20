(function() {
  define(['angular'], function(ng) {
    var DEFAULT_VALUE, demographics;
    demographics = ng.module('qiprofile.demographics', []);
    DEFAULT_VALUE = 'Not specified';
    demographics.factory('Race', function() {
      var CHOICES;
      CHOICES = {
        White: 'White',
        Black: 'Black or African American',
        Asian: 'Asian',
        AIAN: 'American Indian or Alaska Native',
        NHOPI: 'Native Hawaiian or Other Pacific Islander'
      };
      return {
        toDisplayValue: function(dbValue) {
          if (dbValue != null) {
            return CHOICES[dbValue] || (function() {
              throw new ReferenceError("Race database value not recognized: " + dbValue);
            })();
          } else {
            return DEFAULT_VALUE;
          }
        }
      };
    });
    return demographics.factory('Ethnicity', function() {
      var CHOICES;
      CHOICES = {
        Hispanic: 'Hispanic or Latino',
        'Non-Hispanic': 'Not Hispanic or Latino'
      };
      return {
        toDisplayValue: function(dbValue) {
          if (dbValue != null) {
            return CHOICES[dbValue] || (function() {
              throw new ReferenceError("Ethnicity database value not recognized: " + dbValue);
            })();
          } else {
            return DEFAULT_VALUE;
          }
        }
      };
    });
  });

}).call(this);
