import { provideRouter, RouterConfig } from '@angular/router';

import { ProjectsComponent } from '../projects/projects.component.ts';
import { CollectionsComponent } from '../collections/collections.component.ts';
import { CollectionComponent } from '../collection/collection.component.ts';

// Note: nesting children paths results in resolution of /qiprofile/<project>
// to the Project List page with url missing any path. Parent paths cannot
// be abstract, i.e. must have a component, and work-arounds are clumsy or
// broken.
let routes: RouterConfig = [
  {
    path: '',
    component: ProjectsComponent
  },
  {
    path: ':project',
    component: CollectionsComponent
  },
  {
    path: ':project/:collection',
    component: CollectionComponent
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
