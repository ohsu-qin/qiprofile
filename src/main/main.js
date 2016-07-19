import './shims.js';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { APP_ROUTER_PROVIDERS } from './app.routes.ts';
import { HTTP_PROVIDERS } from '@angular/http';
import { RESOURCE_PROVIDERS } from 'ng2-resource-rest';

import { AppComponent } from './app.component.ts';

bootstrap(AppComponent,
          [APP_ROUTER_PROVIDERS, HTTP_PROVIDERS, RESOURCE_PROVIDERS]
).catch(err => console.error(err));
