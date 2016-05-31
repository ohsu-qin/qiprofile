import '../shims.js';
import { Component } from '@angular/core';
import { bootstrap } from 'platform-browser-dynamic';
import { CollectionsComponent } from './collections.component.ts';

@Component({
  selector: 'qiprofile-app',
  template: '<collections></collections>',
  directives: [CollectionsComponent]
})

class AppComponent { }

bootstrap(AppComponent);
