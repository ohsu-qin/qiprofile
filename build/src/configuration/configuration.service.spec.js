(function() {
  import { describe, it, expect, inject, addProviders } from "@angular/core/testing";
  import { ConfigurationService } from "./configuration.service.ts";

  /**
   * The {{#crossLink "ConfigurationService"}}{{/crossLink}} validator.
   *
   * @module configuration
   * @class ConfigurationServiceSpec
   */
  describe('The Configuration service', function() {

    /**
     * Runs the given test body on the injected component and service.
     *
     * @method test
     * @private
     * @param body {function(CollectionsComponent, CollectionsService)} the test body
     */
    var test;
    test = function(body) {
      return inject([ConfigurationService], function(service) {
        return body(service);
      });
    };
    beforeEach(function() {
      return addProviders([ConfigurationService]);
    });
    return describe('The labels', function() {
      it('should have the Demographics section', test(function(service) {
        var demographics;
        demographics = service.labels['Demographics'];
        return expect(demographics, "The Demographics section is missing").to.exist;
      }));
      it('should have the Pathology section', test(function(service) {
        var pathology;
        pathology = service.labels['Pathology'];
        return expect(pathology, "The Pathology section is missing").to.exist;
      }));
      it('should have the Modeling section', test(function(service) {
        var modeling;
        modeling = service.labels['Modeling'];
        return expect(modeling, "The Modeling section is missing").to.exist;
      }));
      it('should have a rcbIndex entry', test(function(service) {
        var actual, expected;
        expected = service.labels['Pathology']['rcbIndex'];
        expect(expected, "The rcbIndex entry was not found").to.exist;
        actual = service.getLabel('rcbIndex');
        expect(actual, "The label does not match the configuration entry").to.equal(expected);
        actual = service.getLabel('rcbIndex', 'Pathology');
        expect(actual, "The label fetched by section does not match the configuration entry").to.equal(expected);
        actual = service.getLabel('rcbIndex', 'Modeling');
        return expect(actual, "The label fetched by a different section is not the default").to.equal('Rcb Index');
      }));
      return it('should make a default label', test(function(service) {
        var label;
        label = service.getLabel('camelCase');
        expect(label, "The default label is missing").to.exist;
        return expect(label, "The default label is incorrect").to.equal('Camel Case');
      }));
    });
  });

}).call(this);
