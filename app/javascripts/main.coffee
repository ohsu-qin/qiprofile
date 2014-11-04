# This script configures require.js.

# NODE_ENV is set by the Grunt env task. The Grunt preprocess
# task conditionally assigns the min suffix and time-out variables.
ENV = '/* @echo NODE_ENV */'

# Set the module name suffix and module load timeout.
if ENV is 'production'
  MIN = '.min'  # the minimized file
  WAIT = 3      # less than the default of 7
else
  MIN = ''      # the unminimized file
  WAIT = 1      # go to the cache quickly

# The Google CDN.
GOOGLE_LIBS = '//ajax.googleapis.com/ajax/libs'

# The Angular version.
NG_VERSION = '1.2.19'

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
    d3: './lib/d3'
    domReady: [DOM_READY_LIB + '/domReady' + MIN, './lib/domReady']
    lodash: './lib/lodash.underscore'
    moment: './lib/moment'
    nganimate: [NG_LIB + '/' + 'angular-animate' + MIN, './lib/angular-animate']  
    ngresource: [NG_LIB + '/' + 'angular-resource' + MIN, './lib/angular-resource']  
    ngroute: [NG_LIB + '/' + 'angular-route' + MIN, './lib/angular-route']
    ngnvd3: './lib/angularjs-nvd3-directives'
    nvd3: './lib/nv.d3'
    slider: './lib/angular-slider'
    spin: './lib/spin'
    stacktrace: './lib/stacktrace'
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
    nganimate: deps: ['angular']
    ngnvd3: deps: ['angular', 'nvd3']
    ngresource: deps: ['angular']
    ngroute: deps: ['angular']
    nvd3: deps: ['d3']
    slider: deps: ['touch']
    touch: deps: ['angular']
    uibootstrap: deps: ['angular']
    uirouter: deps: ['ngroute']
  
  # Load the app after require is configured.
  deps: ['bootstrap']

