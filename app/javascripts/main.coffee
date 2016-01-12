# This script configures require.js.

# NODE_ENV is set by the Grunt env task. The Grunt preprocess
# task conditionally assigns the min suffix and time-out variables.
ENV = '/* @echo NODE_ENV */'

# Set the module name suffix and load timeout.

# Set the module.
if ENV is 'production'
  MIN = '.min'  # the minimized file
  WAIT = 5        # less than the default of 7
else
  MIN = ''      # the unminimized file
  # TODO - deploy on Heroku in production mode, then set dev WAIT
  # to 1.
  #WAIT = 1      # fall back quickly in dev mode
  WAIT = 5

# The Google CDN.
GOOGLE_LIBS = '//ajax.googleapis.com/ajax/libs'

# The Angular version.
# Note: this version number must match the bower.json angularjs
# version number.
NG_VERSION = '1.4.9'

# The Angular CDN location.
NG_LIB = GOOGLE_LIBS + '/angularjs/' + NG_VERSION

# The CloudFlare CDN.
CLOUDFLARE_LIBS = '//cdnjs.cloudflare.com/ajax/libs'

# The CloudFlare library locations.
DOM_READY_LIB = CLOUDFLARE_LIBS + '/require-domReady/2.0.1'

# The require.js configuration.
requirejs.config
  # The application root directory.
  appDir: '../..'

  # The application Javascript base.
  baseUrl: '/javascripts'

  waitSeconds: WAIT

  # The module paths.
  paths:
    angular: [NG_LIB + '/' + 'angular' + MIN, './lib/angular'] 
    cornerstone: './lib/cornerstone'
    cornerstoneMath: './lib/cornerstoneMath'
    cornerstoneTools: './lib/cornerstoneTools'
    crossfilter: './lib/crossfilter'
    d3: './lib/d3'
    dc: './lib/dc'
    domReady: [DOM_READY_LIB + '/domReady' + MIN, './lib/domReady']
    'error-stack-parser': './lib/error-stack-parser'
    exampleImageLoader: './temp/exampleImageLoader'
    jquery: './lib/jquery'
    lodash: './lib/lodash'
    moment: './lib/moment'
    nganimate: [NG_LIB + '/' + 'angular-animate' + MIN, './lib/angular-animate']
    ngresource: [NG_LIB + '/' + 'angular-resource' + MIN, './lib/angular-resource']
    ngroute: [NG_LIB + '/' + 'angular-route' + MIN, './lib/angular-route']
    ngsanitize: [NG_LIB + '/' + 'angular-sanitize' + MIN, './lib/angular-sanitize']
    ngnvd3: './lib/angularjs-nvd3-directives'
    nvd3: './lib/nv.d3'
    slider: './lib/angular-slider'
    'source-map': './lib/source-map'
    spin: './lib/spin'
    'stack-generator': './lib/stack-generator'
    stackframe: './lib/stackframe'
    stackScrollTool: './temp/stackScrollTool'
    stacktrace: './lib/stacktrace'
    'stacktrace-gps': './lib/stacktrace-gps'
    touch: './lib/angular-touch'
    'underscore.string': './lib/underscore.string'
    uirouter: './lib/angular-ui-router'
    uibootstrap: './lib/ui-bootstrap-tpls'
    xtk: './lib/xtk'

  # The module configurations.
  config:
    moment:
      noGlobal: true

  # The non-AMD module dependencies.
  shim:
    angular: exports : 'angular'
    lodash: exports: '_'
    cornerstone: deps: ['jquery']
    cornerstoneMath: deps: ['cornerstone']
    cornerstoneTools: deps: ['cornerstoneMath']
    dc: deps: ['crossfilter', 'd3']
    exampleImageLoader: deps: ['stackScrollTool']
    nganimate: deps: ['angular']
    ngnvd3: deps: ['angular', 'nvd3']
    ngresource: deps: ['angular']
    ngroute: deps: ['angular']
    ngsanitize: deps: ['angular']
    nvd3: deps: ['d3']
    slider: deps: ['touch']
    stackScrollTool: deps: ['cornerstone']
    touch: deps: ['angular']
    uibootstrap: deps: ['angular']
    uirouter: deps: ['ngroute']

  # Load the app after require is configured.
  deps: ['bootstrap']

