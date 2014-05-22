module.exports = ->
  framework: 'mocha'

  capabilities:
    'browserName': 'chrome'

  plugins: ['protractor-coffee-preprocessor']  

  baseUrl: 'http://localhost:3001/quip/'
