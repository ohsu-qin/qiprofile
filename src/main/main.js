import './shims.js';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { ROUTER_PROVIDERS } from '@angular/router';
import { HTTP_PROVIDERS } from '@angular/http';
import { RESOURCE_PROVIDERS } from 'ng2-resource-rest';

import { AppComponent } from './app.component.ts';

bootstrap(AppComponent,
          [ROUTER_PROVIDERS, HTTP_PROVIDERS, RESOURCE_PROVIDERS]
).catch(err => console.error(err));
