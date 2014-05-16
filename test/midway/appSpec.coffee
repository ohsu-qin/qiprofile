describe 'Midway Testing qiprofile', () ->
  module = null
  
  before () ->
    module = angular.module('qiprofile')

  # If this doesn't pass, then the app is DOA.
  it 'should be registered', () ->
    expect(module).to.exist
