SystemJS.config({
  browserConfig: {
    'baseURL': '.'
  },
  paths: {
    'github:': 'jspm_packages/github/',
    'npm:': 'jspm_packages/npm/',
    'app/': 'src/'
  },
  devConfig: {
    'map': {
      'babel-runtime': 'npm:babel-runtime@5.8.38',
      'core-js': 'npm:core-js@1.2.7',
      'encoding': 'npm:encoding@0.1.12',
      'text-encoding': 'npm:text-encoding@0.6.0',
      'systemjs-hot-reloader': 'github:alexisvincent/systemjs-hot-reloader@0.6.0'
    },
    'packages': {
      'npm:encoding@0.1.12': {
        'map': {
          'iconv-lite': 'npm:iconv-lite@0.4.13'
        }
      },
      'github:alexisvincent/systemjs-hot-reloader@0.6.0': {
        'map': {
          'debug': 'npm:debug@2.2.0',
          'weakee': 'npm:weakee@1.0.0',
          'socket.io-client': 'github:socketio/socket.io-client@1.7.2'
        }
      }
    }
  },
  transpiler: 'plugin-babel',
  typescriptOptions: {
    'module': 'System',
    'target': 'ES2016',
    'typeCheck': false,
    'tsconfig': true,
    'sourceMap': true,
    'removeComments': false
  },
  packages: {
    'src': {
      'main': 'main/main.ts',
      'meta': {
        '*.ts': {
          'loader': 'ts'
        },
        '*.js': {
          'loader': 'plugin-babel'
        },
        '*.coffee': {
          'loader': 'coffee'
        },
        '*.md': {
          'loader': 'md'
        },
        '*.css': {
          'loader': 'css'
        },
        '*.html': {
          'loader': 'text'
        },
        '*.cfg': {
          'loader': 'text'
        },
        '*.json': {
          'loader': 'json'
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    'npm:@*/*.json',
    'npm:*.json',
    'github:*/*.json'
  ],
  map: {
    '@angular/common': 'npm:@angular/common@4.0.2',
    '@angular/compiler': 'npm:@angular/compiler@4.0.2',
    '@angular/core': 'npm:@angular/core@4.0.2',
    '@angular/forms': 'npm:@angular/forms@4.0.2',
    '@angular/http': 'npm:@angular/http@4.0.2',
    '@angular/platform-browser': 'npm:@angular/platform-browser@4.0.2',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic@4.0.2',
    '@angular/router': 'npm:@angular/router@4.0.2',
    'css': 'github:systemjs/plugin-css@0.1.27',
    'bowser': 'npm:bowser@1.4.5',
    'gifti-reader-js': 'npm:gifti-reader-js@0.4.3',
    'isarray': 'npm:isarray@1.0.0',
    'ieee754': 'npm:ieee754@1.1.8',
    'base64-js': 'npm:base64-js@1.2.0',
    'ini-parser': 'npm:ini-parser@0.0.2',
    'd3': 'npm:d3@4.2.2',
    'assert': 'github:jspm/nodelibs-assert@0.2.0-alpha',
    'buffer': 'github:jspm/nodelibs-buffer@0.2.0-alpha',
    'child_process': 'github:jspm/nodelibs-child_process@0.2.0-alpha',
    'coffee': 'github:forresto/system-coffee@master',
    'constants': 'github:jspm/nodelibs-constants@0.2.0-alpha',
    'crypto': 'github:jspm/nodelibs-crypto@0.2.0-alpha',
    'events': 'github:jspm/nodelibs-events@0.2.0-alpha',
    'https': 'github:jspm/nodelibs-https@0.2.0-alpha',
    'domain': 'npm:jspm-nodelibs-domain@0.2.0',
    'fs': 'github:jspm/nodelibs-fs@0.2.0-alpha',
    'http': 'github:jspm/nodelibs-http@0.2.0-alpha',
    'json': 'github:systemjs/plugin-json@0.1.2',
    'lodash': 'npm:lodash@4.15.0',
    'md': 'github:guybedford/system-md@0.1.0',
    'module': 'github:jspm/nodelibs-module@0.2.0-alpha',
    'moment': 'npm:moment@2.14.1',
    'net': 'github:jspm/nodelibs-net@0.2.0-alpha',
    'ng2-resource-rest': 'npm:ng2-resource-rest@0.5.6',
    'nouislider': 'npm:nouislider@8.5.1',
    'ohsu-qin/ng2-nouislider': 'github:ohsu-qin/ng2-nouislider@0.3.0',
    'os': 'github:jspm/nodelibs-os@0.2.0-alpha',
    'pako': 'npm:pako@0.2.9',
    'path': 'github:jspm/nodelibs-path@0.2.0-alpha',
    'plugin-babel': 'npm:systemjs-plugin-babel@0.0.21',
    'plugin-typescript': 'github:frankwallis/plugin-typescript@7.0.4',
    'requirejs': 'npm:requirejs@2.3.1',
    'process': 'github:jspm/nodelibs-process@0.2.0-alpha',
    'querystring': 'npm:jspm-nodelibs-querystring@0.2.0',
    'reflect-metadata': 'npm:reflect-metadata@0.1.8',
    'rxjs': 'npm:rxjs@5.2.0',
    'socket.io': 'npm:socket.io@1.4.8',
    'socket.io-client': 'npm:socket.io-client@1.4.8',
    'sprintf': 'npm:sprintf@0.1.5',
    'stream': 'github:jspm/nodelibs-stream@0.2.0-alpha',
    'string_decoder': 'github:jspm/nodelibs-string_decoder@0.2.0-alpha',
    'text': 'github:systemjs/plugin-text@0.0.8',
    'timers': 'github:jspm/nodelibs-timers@0.2.0-alpha',
    'tls': 'npm:jspm-nodelibs-tls@0.2.0',
    'ts': 'github:frankwallis/plugin-typescript@7.0.4',
    'tty': 'npm:jspm-nodelibs-tty@0.2.0',
    'typescript': 'npm:typescript@2.2.1',
    'underscore.string': 'npm:underscore.string@3.3.4',
    'url': 'github:jspm/nodelibs-url@0.2.0-alpha',
    'util': 'github:jspm/nodelibs-util@0.2.0-alpha',
    'vm': 'github:jspm/nodelibs-vm@0.2.0-alpha',
    'zlib': 'github:jspm/nodelibs-zlib@0.2.0-alpha',
    'zone.js': 'npm:zone.js@0.8.5'
  },
  packages: {
    'npm:debug@2.2.0': {
      'map': {
        'ms': 'npm:ms@0.7.1'
      }
    },
    'npm:stream-browserify@2.0.1': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'readable-stream': 'npm:readable-stream@2.2.3'
      }
    },
    'npm:browserify-zlib@0.1.4': {
      'map': {
        'readable-stream': 'npm:readable-stream@2.1.5',
        'pako': 'npm:pako@0.2.9'
      }
    },
    'npm:url@0.11.0': {
      'map': {
        'punycode': 'npm:punycode@1.3.2',
        'querystring': 'npm:querystring@0.2.0'
      }
    },
    'npm:crypto-browserify@3.11.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'browserify-cipher': 'npm:browserify-cipher@1.0.0',
        'browserify-sign': 'npm:browserify-sign@4.0.0',
        'create-hmac': 'npm:create-hmac@1.1.4',
        'create-ecdh': 'npm:create-ecdh@4.0.0',
        'diffie-hellman': 'npm:diffie-hellman@5.0.2',
        'pbkdf2': 'npm:pbkdf2@3.0.9',
        'create-hash': 'npm:create-hash@1.1.2',
        'randombytes': 'npm:randombytes@2.0.3',
        'public-encrypt': 'npm:public-encrypt@4.0.0'
      }
    },
    'npm:browserify-sign@4.0.0': {
      'map': {
        'create-hmac': 'npm:create-hmac@1.1.4',
        'inherits': 'npm:inherits@2.0.3',
        'create-hash': 'npm:create-hash@1.1.2',
        'browserify-rsa': 'npm:browserify-rsa@4.0.1',
        'bn.js': 'npm:bn.js@4.11.6',
        'parse-asn1': 'npm:parse-asn1@5.0.0',
        'elliptic': 'npm:elliptic@6.4.0'
      }
    },
    'npm:create-hmac@1.1.4': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'create-hash': 'npm:create-hash@1.1.2'
      }
    },
    'npm:diffie-hellman@5.0.2': {
      'map': {
        'randombytes': 'npm:randombytes@2.0.3',
        'bn.js': 'npm:bn.js@4.11.6',
        'miller-rabin': 'npm:miller-rabin@4.0.0'
      }
    },
    'npm:create-hash@1.1.2': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'sha.js': 'npm:sha.js@2.4.8',
        'ripemd160': 'npm:ripemd160@1.0.1'
      }
    },
    'npm:public-encrypt@4.0.0': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.2',
        'randombytes': 'npm:randombytes@2.0.3',
        'browserify-rsa': 'npm:browserify-rsa@4.0.1',
        'bn.js': 'npm:bn.js@4.11.6',
        'parse-asn1': 'npm:parse-asn1@5.0.0'
      }
    },
    'npm:browserify-cipher@1.0.0': {
      'map': {
        'browserify-des': 'npm:browserify-des@1.0.0',
        'browserify-aes': 'npm:browserify-aes@1.0.6',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0'
      }
    },
    'npm:browserify-des@1.0.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'des.js': 'npm:des.js@1.0.0'
      }
    },
    'npm:create-ecdh@4.0.0': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'elliptic': 'npm:elliptic@6.4.0'
      }
    },
    'npm:browserify-aes@1.0.6': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.2',
        'inherits': 'npm:inherits@2.0.3',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'buffer-xor': 'npm:buffer-xor@1.0.3'
      }
    },
    'npm:evp_bytestokey@1.0.0': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.2'
      }
    },
    'npm:browserify-rsa@4.0.1': {
      'map': {
        'randombytes': 'npm:randombytes@2.0.3',
        'bn.js': 'npm:bn.js@4.11.6'
      }
    },
    'npm:parse-asn1@5.0.0': {
      'map': {
        'browserify-aes': 'npm:browserify-aes@1.0.6',
        'create-hash': 'npm:create-hash@1.1.2',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0',
        'pbkdf2': 'npm:pbkdf2@3.0.9',
        'asn1.js': 'npm:asn1.js@4.9.1'
      }
    },
    'npm:miller-rabin@4.0.0': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'brorand': 'npm:brorand@1.1.0'
      }
    },
    'npm:des.js@1.0.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0'
      }
    },
    'npm:hash.js@1.0.3': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:socket.io-adapter@0.4.0': {
      'map': {
        'socket.io-parser': 'npm:socket.io-parser@2.2.2',
        'debug': 'npm:debug@2.2.0'
      }
    },
    'npm:socket.io-parser@2.2.6': {
      'map': {
        'debug': 'npm:debug@2.2.0',
        'component-emitter': 'npm:component-emitter@1.1.2',
        'isarray': 'npm:isarray@0.0.1',
        'benchmark': 'npm:benchmark@1.0.0',
        'json3': 'npm:json3@3.3.2'
      }
    },
    'npm:socket.io-parser@2.2.2': {
      'map': {
        'debug': 'npm:debug@0.7.4',
        'component-emitter': 'npm:component-emitter@1.1.2',
        'isarray': 'npm:isarray@0.0.1',
        'benchmark': 'npm:benchmark@1.0.0',
        'json3': 'npm:json3@3.2.6'
      }
    },
    'npm:engine.io-parser@1.2.4': {
      'map': {
        'has-binary': 'npm:has-binary@0.1.6',
        'after': 'npm:after@0.8.1',
        'arraybuffer.slice': 'npm:arraybuffer.slice@0.0.6',
        'utf8': 'npm:utf8@2.1.0',
        'base64-arraybuffer': 'npm:base64-arraybuffer@0.1.2',
        'blob': 'npm:blob@0.0.4'
      }
    },
    'npm:has-binary@0.1.7': {
      'map': {
        'isarray': 'npm:isarray@0.0.1'
      }
    },
    'npm:has-binary@0.1.6': {
      'map': {
        'isarray': 'npm:isarray@0.0.1'
      }
    },
    'npm:accepts@1.3.1': {
      'map': {
        'negotiator': 'npm:negotiator@0.6.0',
        'mime-types': 'npm:mime-types@2.1.11'
      }
    },
    'npm:parseuri@0.0.4': {
      'map': {
        'better-assert': 'npm:better-assert@1.0.2'
      }
    },
    'npm:mime-types@2.1.11': {
      'map': {
        'mime-db': 'npm:mime-db@1.23.0'
      }
    },
    'npm:better-assert@1.0.2': {
      'map': {
        'callsite': 'npm:callsite@1.0.0'
      }
    },
    'npm:ws@1.0.1': {
      'map': {
        'utf-8-validate': 'npm:utf-8-validate@1.2.1',
        'ultron': 'npm:ultron@1.0.2',
        'options': 'npm:options@0.0.6',
        'bufferutil': 'npm:bufferutil@1.2.1'
      }
    },
    'npm:parseqs@0.0.2': {
      'map': {
        'better-assert': 'npm:better-assert@1.0.2'
      }
    },
    'npm:parsejson@0.0.1': {
      'map': {
        'better-assert': 'npm:better-assert@1.0.2'
      }
    },
    'npm:utf-8-validate@1.2.1': {
      'map': {
        'bindings': 'npm:bindings@1.2.1',
        'nan': 'npm:nan@2.4.0'
      }
    },
    'npm:bufferutil@1.2.1': {
      'map': {
        'bindings': 'npm:bindings@1.2.1',
        'nan': 'npm:nan@2.4.0'
      }
    },
    'github:guybedford/system-md@0.1.0': {
      'map': {
        'showdown': 'github:showdownjs/showdown@1.4.3'
      }
    },
    'npm:socket.io-client@1.4.8': {
      'map': {
        'component-bind': 'npm:component-bind@1.0.0',
        'object-component': 'npm:object-component@0.0.3',
        'component-emitter': 'npm:component-emitter@1.2.0',
        'engine.io-client': 'npm:engine.io-client@1.6.11',
        'to-array': 'npm:to-array@0.1.4',
        'debug': 'npm:debug@2.2.0',
        'indexof': 'npm:indexof@0.0.1',
        'socket.io-parser': 'npm:socket.io-parser@2.2.6',
        'backo2': 'npm:backo2@1.0.2',
        'parseuri': 'npm:parseuri@0.0.4',
        'has-binary': 'npm:has-binary@0.1.7'
      }
    },
    'npm:socket.io@1.4.8': {
      'map': {
        'socket.io-client': 'npm:socket.io-client@1.4.8',
        'socket.io-adapter': 'npm:socket.io-adapter@0.4.0',
        'debug': 'npm:debug@2.2.0',
        'socket.io-parser': 'npm:socket.io-parser@2.2.6',
        'has-binary': 'npm:has-binary@0.1.7',
        'engine.io': 'npm:engine.io@1.6.11'
      }
    },
    'npm:engine.io@1.6.11': {
      'map': {
        'debug': 'npm:debug@2.2.0',
        'accepts': 'npm:accepts@1.3.1',
        'engine.io-parser': 'npm:engine.io-parser@1.2.4',
        'base64id': 'npm:base64id@0.1.0',
        'ws': 'npm:ws@1.0.1'
      }
    },
    'npm:engine.io-client@1.6.11': {
      'map': {
        'component-emitter': 'npm:component-emitter@1.1.2',
        'indexof': 'npm:indexof@0.0.1',
        'debug': 'npm:debug@2.2.0',
        'parseuri': 'npm:parseuri@0.0.4',
        'engine.io-parser': 'npm:engine.io-parser@1.2.4',
        'has-cors': 'npm:has-cors@1.1.0',
        'yeast': 'npm:yeast@0.1.2',
        'ws': 'npm:ws@1.0.1',
        'node-ws': 'npm:ws@1.0.1',
        'parseqs': 'npm:parseqs@0.0.2',
        'xmlhttprequest-ssl': 'npm:xmlhttprequest-ssl@1.5.1',
        'node-xmlhttprequest-ssl': 'npm:xmlhttprequest-ssl@1.5.1',
        'parsejson': 'npm:parsejson@0.0.1',
        'component-inherit': 'npm:component-inherit@0.0.3'
      }
    },
    'npm:underscore.string@3.3.4': {
      'map': {
        'util-deprecate': 'npm:util-deprecate@1.0.2',
        'sprintf-js': 'npm:sprintf-js@1.0.3'
      }
    },
    'npm:buffer@4.9.1': {
      'map': {
        'ieee754': 'npm:ieee754@1.1.8',
        'isarray': 'npm:isarray@1.0.0',
        'base64-js': 'npm:base64-js@1.2.0'
      }
    },
    'npm:gifti-reader-js@0.4.3': {
      'map': {
        'sax': 'npm:sax@1.2.1',
        'pako': 'npm:pako@0.2.9'
      }
    },
    'npm:d3@4.2.2': {
      'map': {
        'd3-brush': 'npm:d3-brush@1.0.2',
        'd3-axis': 'npm:d3-axis@1.0.3',
        'd3-array': 'npm:d3-array@1.0.1',
        'd3-ease': 'npm:d3-ease@1.0.1',
        'd3-path': 'npm:d3-path@1.0.1',
        'd3-dsv': 'npm:d3-dsv@1.0.1',
        'd3-polygon': 'npm:d3-polygon@1.0.1',
        'd3-collection': 'npm:d3-collection@1.0.1',
        'd3-force': 'npm:d3-force@1.0.2',
        'd3-interpolate': 'npm:d3-interpolate@1.1.1',
        'd3-geo': 'npm:d3-geo@1.2.3',
        'd3-selection': 'npm:d3-selection@1.0.2',
        'd3-shape': 'npm:d3-shape@1.0.2',
        'd3-time-format': 'npm:d3-time-format@2.0.2',
        'd3-drag': 'npm:d3-drag@1.0.1',
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-queue': 'npm:d3-queue@3.0.2',
        'd3-scale': 'npm:d3-scale@1.0.3',
        'd3-timer': 'npm:d3-timer@1.0.2',
        'd3-format': 'npm:d3-format@1.0.2',
        'd3-voronoi': 'npm:d3-voronoi@1.0.2',
        'd3-zoom': 'npm:d3-zoom@1.0.3',
        'd3-quadtree': 'npm:d3-quadtree@1.0.1',
        'd3-color': 'npm:d3-color@1.0.1',
        'd3-time': 'npm:d3-time@1.0.2',
        'd3-random': 'npm:d3-random@1.0.1',
        'd3-transition': 'npm:d3-transition@1.0.1',
        'd3-chord': 'npm:d3-chord@1.0.2',
        'd3-hierarchy': 'npm:d3-hierarchy@1.0.2',
        'd3-request': 'npm:d3-request@1.0.2'
      }
    },
    'npm:d3-brush@1.0.2': {
      'map': {
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-drag': 'npm:d3-drag@1.0.1',
        'd3-interpolate': 'npm:d3-interpolate@1.1.1',
        'd3-selection': 'npm:d3-selection@1.0.2',
        'd3-transition': 'npm:d3-transition@1.0.2'
      }
    },
    'npm:d3-force@1.0.2': {
      'map': {
        'd3-collection': 'npm:d3-collection@1.0.1',
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-quadtree': 'npm:d3-quadtree@1.0.1',
        'd3-timer': 'npm:d3-timer@1.0.3'
      }
    },
    'npm:d3-interpolate@1.1.1': {
      'map': {
        'd3-color': 'npm:d3-color@1.0.1'
      }
    },
    'npm:d3-geo@1.2.3': {
      'map': {
        'd3-array': 'npm:d3-array@1.0.1'
      }
    },
    'npm:d3-shape@1.0.2': {
      'map': {
        'd3-path': 'npm:d3-path@1.0.1'
      }
    },
    'npm:d3-time-format@2.0.2': {
      'map': {
        'd3-time': 'npm:d3-time@1.0.2'
      }
    },
    'npm:d3-drag@1.0.1': {
      'map': {
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-selection': 'npm:d3-selection@1.0.2'
      }
    },
    'npm:d3-zoom@1.0.3': {
      'map': {
        'd3-transition': 'npm:d3-transition@1.0.2',
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-drag': 'npm:d3-drag@1.0.1',
        'd3-interpolate': 'npm:d3-interpolate@1.1.1',
        'd3-selection': 'npm:d3-selection@1.0.2'
      }
    },
    'npm:d3-scale@1.0.3': {
      'map': {
        'd3-array': 'npm:d3-array@1.0.1',
        'd3-collection': 'npm:d3-collection@1.0.1',
        'd3-color': 'npm:d3-color@1.0.1',
        'd3-format': 'npm:d3-format@1.0.2',
        'd3-interpolate': 'npm:d3-interpolate@1.1.1',
        'd3-time': 'npm:d3-time@1.0.2',
        'd3-time-format': 'npm:d3-time-format@2.0.2'
      }
    },
    'npm:d3-transition@1.0.1': {
      'map': {
        'd3-color': 'npm:d3-color@1.0.1',
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-ease': 'npm:d3-ease@1.0.1',
        'd3-interpolate': 'npm:d3-interpolate@1.1.1',
        'd3-selection': 'npm:d3-selection@1.0.2',
        'd3-timer': 'npm:d3-timer@1.0.3'
      }
    },
    'npm:d3-dsv@1.0.1': {
      'map': {
        'rw': 'npm:rw@1.3.2'
      }
    },
    'npm:d3-chord@1.0.2': {
      'map': {
        'd3-array': 'npm:d3-array@1.0.1',
        'd3-path': 'npm:d3-path@1.0.1'
      }
    },
    'npm:d3-request@1.0.2': {
      'map': {
        'd3-collection': 'npm:d3-collection@1.0.1',
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-dsv': 'npm:d3-dsv@1.0.1',
        'xmlhttprequest': 'npm:xmlhttprequest@1.8.0'
      }
    },
    'npm:stream-http@2.3.1': {
      'map': {
        'readable-stream': 'npm:readable-stream@2.1.5',
        'to-arraybuffer': 'npm:to-arraybuffer@1.0.1',
        'builtin-status-codes': 'npm:builtin-status-codes@2.0.0',
        'xtend': 'npm:xtend@4.0.1',
        'inherits': 'npm:inherits@2.0.1'
      }
    },
    'npm:readable-stream@2.1.5': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'isarray': 'npm:isarray@1.0.0',
        'string_decoder': 'npm:string_decoder@0.10.31',
        'process-nextick-args': 'npm:process-nextick-args@1.0.7',
        'buffer-shims': 'npm:buffer-shims@1.0.0',
        'core-util-is': 'npm:core-util-is@1.0.2',
        'util-deprecate': 'npm:util-deprecate@1.0.2'
      }
    },
    'npm:d3-transition@1.0.2': {
      'map': {
        'd3-color': 'npm:d3-color@1.0.1',
        'd3-dispatch': 'npm:d3-dispatch@1.0.1',
        'd3-ease': 'npm:d3-ease@1.0.1',
        'd3-interpolate': 'npm:d3-interpolate@1.1.1',
        'd3-selection': 'npm:d3-selection@1.0.2',
        'd3-timer': 'npm:d3-timer@1.0.3'
      }
    },
    'npm:cipher-base@1.0.3': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:pbkdf2@3.0.9': {
      'map': {
        'create-hmac': 'npm:create-hmac@1.1.4'
      }
    },
    'npm:timers-browserify@1.4.2': {
      'map': {
        'process': 'npm:process@0.11.9'
      }
    },
    'npm:jspm-nodelibs-domain@0.2.0': {
      'map': {
        'domain-browserify': 'npm:domain-browser@1.1.7'
      }
    },
    'github:jspm/nodelibs-http@0.2.0-alpha': {
      'map': {
        'http-browserify': 'npm:stream-http@2.3.1'
      }
    },
    'npm:typescript@2.2.1': {
      'map': {
        'source-map-support': 'npm:source-map-support@0.4.11'
      }
    },
    'npm:source-map-support@0.4.11': {
      'map': {
        'source-map': 'npm:source-map@0.5.6'
      }
    },
    'github:jspm/nodelibs-buffer@0.2.0-alpha': {
      'map': {
        'buffer-browserify': 'npm:buffer@4.9.1'
      }
    },
    'github:jspm/nodelibs-os@0.2.0-alpha': {
      'map': {
        'os-browserify': 'npm:os-browserify@0.2.1'
      }
    },
    'github:jspm/nodelibs-crypto@0.2.0-alpha': {
      'map': {
        'crypto-browserify': 'npm:crypto-browserify@3.11.0'
      }
    },
    'npm:elliptic@6.4.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'bn.js': 'npm:bn.js@4.11.6',
        'brorand': 'npm:brorand@1.1.0',
        'hash.js': 'npm:hash.js@1.0.3',
        'minimalistic-crypto-utils': 'npm:minimalistic-crypto-utils@1.0.1',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0',
        'hmac-drbg': 'npm:hmac-drbg@1.0.0'
      }
    },
    'npm:sha.js@2.4.8': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:hmac-drbg@1.0.0': {
      'map': {
        'hash.js': 'npm:hash.js@1.0.3',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0',
        'minimalistic-crypto-utils': 'npm:minimalistic-crypto-utils@1.0.1'
      }
    },
    'npm:asn1.js@4.9.1': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'inherits': 'npm:inherits@2.0.3',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0'
      }
    },
    'github:jspm/nodelibs-stream@0.2.0-alpha': {
      'map': {
        'stream-browserify': 'npm:stream-browserify@2.0.1'
      }
    },
    'npm:readable-stream@2.2.3': {
      'map': {
        'isarray': 'npm:isarray@1.0.0',
        'inherits': 'npm:inherits@2.0.3',
        'buffer-shims': 'npm:buffer-shims@1.0.0',
        'string_decoder': 'npm:string_decoder@0.10.31',
        'core-util-is': 'npm:core-util-is@1.0.2',
        'util-deprecate': 'npm:util-deprecate@1.0.2',
        'process-nextick-args': 'npm:process-nextick-args@1.0.7'
      }
    },
    'github:jspm/nodelibs-string_decoder@0.2.0-alpha': {
      'map': {
        'string_decoder-browserify': 'npm:string_decoder@0.10.31'
      }
    },
    'github:jspm/nodelibs-url@0.2.0-alpha': {
      'map': {
        'url-browserify': 'npm:url@0.11.0'
      }
    },
    'github:jspm/nodelibs-timers@0.2.0-alpha': {
      'map': {
        'timers-browserify': 'npm:timers-browserify@1.4.2'
      }
    },
    'github:jspm/nodelibs-zlib@0.2.0-alpha': {
      'map': {
        'zlib-browserify': 'npm:browserify-zlib@0.1.4'
      }
    },
    'npm:rxjs@5.2.0': {
      'map': {
        'symbol-observable': 'npm:symbol-observable@1.0.4'
      }
    }
  }
});
