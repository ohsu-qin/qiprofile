import { provideRouter, RouterConfig } from '@angular/router';

import { ProjectsComponent } from '../projects/projects.component.ts';
import { CollectionsComponent } from '../collections/collections.component.ts';
import { CollectionComponent } from '../collection/collection.component.ts';
import { SubjectComponent } from '../subject/subject.component.ts';
import { SessionComponent } from '../session/session.component.ts';
import { VolumeComponent } from '../volume/volume.component.ts';

// Note: nesting children paths results in resolution of /qiprofile/<project>
// to the Project List page with url missing any path. Parent paths cannot
// be abstract, i.e. must have a component, and work-arounds are clumsy or
// broken.
// TODO - revisit in 2017 when Angular 2 router stabilizes.
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
  },
  {
    path: ':project/:collection/subject/:subject',
    component: SubjectComponent
  },
  {
    path: ':project/:collection/subject/:subject/session/:session',
    component: SessionComponent
  },
  {
    path: ':project/:collection/subject/:subject/session/:session/scan/:scan/volume/:volume',
    component: VolumeComponent
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
