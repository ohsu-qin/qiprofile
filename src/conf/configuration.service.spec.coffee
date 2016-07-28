`import { describe, it, expect, inject, addProviders } from '@angular/core/testing'`

`import { ConfigurationService } from './configuration.service.ts'`

###*
 * {{#crossLink "ConfigurationService"}}{{/crossLink}} validator.
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
   * @param body {function(CollectionsComponent, CollectionService)} the test body
  ###
  test = (body) ->
    inject [ConfigurationService], (service) ->
      # Parse the configuration.
      config = service.configuration
      # Run the test.
      body(config)
      
  beforeEach ->
    addProviders [ConfigurationService]
  
  it 'should have the Demographics section', test (config) ->
    demographics = config['Demographics']
    expect(demographics, "The Demographics section is missing")
        .to.exist

  it 'should have the Pathology section', test (config) ->
    pathology = config['Pathology']
    expect(pathology, "The Pathology section is missing")
        .to.exist

  it 'should have the Modeling section', test (config) ->
    modeling = config['Modeling']
    expect(modeling, "The Modeling section is missing")
        .to.exist
