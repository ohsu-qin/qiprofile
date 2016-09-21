`import { describe, it, expect, inject, addProviders } from "@angular/core/testing"`

`import { ConfigurationService } from "./configuration.service.ts"`

###*
 * The {{#crossLink "ConfigurationService"}}{{/crossLink}} validator.
 *
 * @module configuration
 * @class ConfigurationServiceSpec
###
describe 'The Configuration service', ->
  ###*
   * Runs the given test body on the injected component and service.
   *
   * @method test
   * @private
   * @param body {function(CollectionsComponent, CollectionsService)} the test body
  ###
  test = (body) ->
    inject [ConfigurationService], (service) ->
      # Run the test.
      body(service)
      
  beforeEach ->
    addProviders [ConfigurationService]
  
  describe 'The labels', ->
    it 'should have the Demographics section', test (service) ->
      demographics = service.labels['Demographics']
      expect(demographics, "The Demographics section is missing")
          .to.exist

    it 'should have the Pathology section', test (service) ->
      pathology = service.labels['Pathology']
      expect(pathology, "The Pathology section is missing")
          .to.exist

    it 'should have the Modeling section', test (service) ->
      modeling = service.labels['Modeling']
      expect(modeling, "The Modeling section is missing")
          .to.exist
  
    it 'should have a rcbIndex entry', test (service) ->
      expected = service.labels['Pathology']['rcbIndex']
      expect(expected, "The rcbIndex entry was not found")
          .to.exist
      actual = service.getLabel('rcbIndex')
      expect(actual, "The label does not match the configuration entry")
          .to.equal(expected)
      actual = service.getLabel('rcbIndex', 'Pathology')
      expect(actual, "The label fetched by section does not match the configuration entry")
          .to.equal(expected)
      actual = service.getLabel('rcbIndex', 'Modeling')
      expect(actual, "The label fetched by a different section is not the default")
          .to.equal('Rcb Index')
  
    it 'should make a default label', test (service) ->
      label = service.getLabel('camelCase')
      expect(label, "The default label is missing")
          .to.exist
      expect(label, "The default label is incorrect")
          .to.equal('Camel Case')
