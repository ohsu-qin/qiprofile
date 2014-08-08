exports.config =
  framework: 'mocha'

  capabilities:
    'browserName': 'chrome'

  plugins: ['protractor-coffee-preprocessor']  

  baseUrl: 'http://localhost:3001/quip/'
  
  specs: ['../e2e/**/*Spec.coffee']

  onPrepare: '../e2e/helpers/seed'
  
  mochaOpts:
    reporter: 'spec'
    slow: 1200
