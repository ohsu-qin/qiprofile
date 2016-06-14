import '../shims.js';
import { Component } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { RESOURCE_PROVIDERS } from 'ng2-resource-rest';

import { CollectionsComponent } from './collections.component.ts';

@Component({
  selector: 'qiprofile-app',
  template: '<collections></collections>',
  directives: [CollectionsComponent]
})

class AppComponent { }

bootstrap(AppComponent, [HTTP_PROVIDERS, RESOURCE_PROVIDERS]);
