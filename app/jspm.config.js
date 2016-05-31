// The manually defined settings.
SystemJS.config({
  browserConfig: {
    "baseURL": "."
  },
  nodeConfig: {
    "paths": {
      "github:": "jspm_packages/github/",
      "npm:": "jspm_packages/npm/"
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.11"
    }
  },
  transpiler: "plugin-babel",
  typescriptOptions: {
    "module": "es6",
    "target": "es6",
    "typeCheck": "strict",
    "tsconfig": true,
    "sourceMap": true,
    "removeComments": false,
    "supportHtmlImports": true
  },
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  packages: {
    "src": {
      "main": "test.ts",
      "defaultExtension": false,
      "meta": {
        "*.js": {
          "loader": "js"
        },
        "*.ts": {
          "loader": "ts"
        },
        "*.css": {
          "loader": "css"
        },
        "*.html": {
          "loader": "text"
        }
      }
    }
  }
});


// The settings created by jspm install.
SystemJS.config({
  map: {
    "@angular/common": "npm:@angular/common@2.0.0-rc.1",
    "@angular/compiler": "npm:@angular/compiler@2.0.0-rc.1",
    "@angular/core": "npm:@angular/core@2.0.0-rc.1",
    "@angular/platform-browser": "npm:@angular/platform-browser@2.0.0-rc.1",
    "@angular/platform-browser-dynamic": "npm:@angular/platform-browser-dynamic@2.0.0-rc.1",
    "@angular/router": "npm:@angular/router@2.0.0-rc.1",
    "assert": "github:jspm/nodelibs-assert@0.2.0-alpha",
    "buffer": "github:jspm/nodelibs-buffer@0.2.0-alpha",
    "common": "npm:@angular/common@2.0.0-rc.1",
    "http": "npm:@angular/http@2.0.0-rc.1",
    "lodash": "npm:lodash@4.13.1",
    "os": "github:jspm/nodelibs-os@0.2.0-alpha",
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.11",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "reflect-metadata": "npm:reflect-metadata@0.1.2",
    "rxjs": "npm:rxjs@5.0.0-beta.6",
    "ts": "github:frankwallis/plugin-typescript@4.0.16",
    "util": "github:jspm/nodelibs-util@0.2.0-alpha",
    "zone.js": "npm:zone.js@0.6.12"
  },
  packages: {
    "github:frankwallis/plugin-typescript@4.0.16": {
      "map": {
        "typescript": "npm:typescript@1.8.10"
      }
    },
    "github:jspm/nodelibs-os@0.2.0-alpha": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "github:jspm/nodelibs-buffer@0.2.0-alpha": {
      "map": {
        "buffer-browserify": "npm:buffer@4.6.0"
      }
    },
    "npm:buffer@4.6.0": {
      "map": {
        "ieee754": "npm:ieee754@1.1.6",
        "isarray": "npm:isarray@1.0.0",
        "base64-js": "npm:base64-js@1.1.2"
      }
    }
  }
});
