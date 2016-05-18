// Note: the magic angular2 /// directive below allows TypeScript to find 
//   angular typings per
//   https://github.com/angular/angular/issues/7280#issuecomment-188777966.
//   See also
//   https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html.
//
//   The rxjs directive was added because of another unresolved reference.
//
//   angular2 and rxjs were added to both node and jspm in packages.json in
//   order to make the type info available.
//
// TODO - revisit the necessity for this obtuse hack.
//
/// <reference path="../../node_modules/angular2/typings/browser.d.ts" />
/// <reference path="../../node_modules/rxjs/Observable.d.ts" />

// The zone, reflect and shim libraries are imported per various examples.
// TODO - explain why they are needed.

import 'zone.js';

import 'reflect-metadata';

import 'es6-shim';

import { bootstrap } from 'angular2/platform/browser';

import { QIProfileComponent } from './qiprofile.component';

bootstrap(QIProfileComponent);
