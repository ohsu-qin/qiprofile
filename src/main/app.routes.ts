import { provideRouter, RouterConfig } from '@angular/router';

import { AppComponent } from './app.component.ts';
import { ProjectsComponent } from '../projects/projects.component.ts';
import { CollectionsComponent } from '../collections/collections.component.ts';
import { CollectionComponent } from '../collection/collection.component.ts';

// Note: nesting children paths results in resolution of /qiprofile/<project>
//   to the Project List page with url missing any path. Parent paths cannot
//   be abstract, i.e. must have a component, and work-arounds are clumsy or
//   broken.
let routes: RouterConfig = [
  {
    path: '/qiprofile',
    component: ProjectsComponent,
    index: true
  },
  {
    path: '/qiprofile/:project',
    component: CollectionsComponent,
    index: true
  },
  {
    path: '/qiprofile/:project/:collection',
    component: CollectionComponent,
    index: true
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
