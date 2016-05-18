System.config({
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "github:*": "_public/javascripts/lib/github/*",
    "npm:*": "_public/javascripts/lib/npm/*"
  },

  map: {
    "@angular2-material/button": "npm:@angular2-material/button@2.0.0-alpha.4-3",
    "@angular2-material/card": "npm:@angular2-material/card@2.0.0-alpha.4-3",
    "@angular2-material/checkbox": "npm:@angular2-material/checkbox@2.0.0-alpha.4-3",
    "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4-3",
    "@angular2-material/input": "npm:@angular2-material/input@2.0.0-alpha.4-3",
    "@angular2-material/list": "npm:@angular2-material/list@2.0.0-alpha.4-3",
    "@angular2-material/progress-bar": "npm:@angular2-material/progress-bar@2.0.0-alpha.4-3",
    "@angular2-material/progress-circle": "npm:@angular2-material/progress-circle@2.0.0-alpha.4-3",
    "@angular2-material/radio": "npm:@angular2-material/radio@2.0.0-alpha.4-3",
    "@angular2-material/sidenav": "npm:@angular2-material/sidenav@2.0.0-alpha.4-3",
    "@angular2-material/toolbar": "npm:@angular2-material/toolbar@2.0.0-alpha.4-3",
    "angular2": "npm:angular2@2.0.0-beta.17",
    "babel": "npm:babel-core@5.8.38",
    "babel-runtime": "npm:babel-runtime@5.8.38",
    "core-js": "npm:core-js@1.2.6",
    "es6-promise": "npm:es6-promise@3.2.1",
    "es6-shim": "github:es-shims/es6-shim@0.35.1",
    "json": "github:systemjs/plugin-json@0.1.2",
    "lodash": "npm:lodash@4.12.0",
    "ng2-bootstrap": "npm:ng2-bootstrap@1.0.16",
    "ng2-translate": "npm:ng2-translate@1.11.3",
    "os": "github:jspm/nodelibs-os@0.2.0-alpha",
    "reflect-metadata": "npm:reflect-metadata@0.1.3",
    "typescript": "npm:typescript@1.8.10",
    "zone.js": "npm:zone.js@0.6.12",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-os@0.1.0": {
      "os-browserify": "npm:os-browserify@0.1.2"
    },
    "github:jspm/nodelibs-os@0.2.0-alpha": {
      "os-browserify": "npm:os-browserify@0.2.1"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.3"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:@angular/common@2.0.0-rc.1": {
      "@angular/core": "npm:@angular/core@2.0.0-rc.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:@angular/compiler@2.0.0-rc.1": {
      "@angular/core": "npm:@angular/core@2.0.0-rc.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:@angular/core@2.0.0-rc.1": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "rxjs": "npm:rxjs@5.0.0-beta.6",
      "zone.js": "npm:zone.js@0.6.12"
    },
    "npm:@angular/platform-browser-dynamic@2.0.0-rc.1": {
      "@angular/common": "npm:@angular/common@2.0.0-rc.1",
      "@angular/compiler": "npm:@angular/compiler@2.0.0-rc.1",
      "@angular/core": "npm:@angular/core@2.0.0-rc.1",
      "@angular/platform-browser": "npm:@angular/platform-browser@2.0.0-rc.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:@angular/platform-browser@2.0.0-rc.1": {
      "@angular/common": "npm:@angular/common@2.0.0-rc.1",
      "@angular/compiler": "npm:@angular/compiler@2.0.0-rc.1",
      "@angular/core": "npm:@angular/core@2.0.0-rc.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:@angular2-material/button@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/card@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/checkbox@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/core@2.0.0-alpha.4": {
      "@angular/common": "npm:@angular/common@2.0.0-rc.1",
      "@angular/core": "npm:@angular/core@2.0.0-rc.1"
    },
    "npm:@angular2-material/core@2.0.0-alpha.4-3": {
      "@angular/common": "npm:@angular/common@2.0.0-rc.1",
      "@angular/core": "npm:@angular/core@2.0.0-rc.1"
    },
    "npm:@angular2-material/input@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/list@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/progress-bar@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:@angular2-material/progress-circle@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/radio@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/sidenav@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:@angular2-material/toolbar@2.0.0-alpha.4-3": {
      "@angular2-material/core": "npm:@angular2-material/core@2.0.0-alpha.4"
    },
    "npm:angular2@2.0.0-beta.17": {
      "reflect-metadata": "npm:reflect-metadata@0.1.2",
      "rxjs": "npm:rxjs@5.0.0-beta.6",
      "zone.js": "npm:zone.js@0.6.12"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.38": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.6",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:es6-promise@3.2.1": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:isarray@1.0.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:lodash@4.12.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:ng2-bootstrap@1.0.16": {
      "@angular/common": "npm:@angular/common@2.0.0-rc.1",
      "@angular/compiler": "npm:@angular/compiler@2.0.0-rc.1",
      "@angular/core": "npm:@angular/core@2.0.0-rc.1",
      "@angular/platform-browser": "npm:@angular/platform-browser@2.0.0-rc.1",
      "@angular/platform-browser-dynamic": "npm:@angular/platform-browser-dynamic@2.0.0-rc.1",
      "moment": "npm:moment@2.13.0"
    },
    "npm:ng2-translate@1.11.3": {
      "angular2": "npm:angular2@2.0.0-beta.17",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:os-browserify@0.1.2": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:os-browserify@0.2.1": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:reflect-metadata@0.1.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:rxjs@5.0.0-beta.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:typescript@1.8.10": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:zone.js@0.6.12": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
