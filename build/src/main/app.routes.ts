import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Note: nesting children paths results in resolution of /qiprofile/<project>
// to the Project List page with the url missing any path. Parent paths cannot
// be abstract, i.e. must have a component, and work-arounds are clumsy or
// broken.
// TODO - revisit in 2017 when the Angular 2 router stabilizes.
export const ROUTE_CONFIG: Routes = [
  {
    path: '',
    loadChildren: 'src/projects/projects.module.ts'
  },
  {
    path: ':project',
    loadChildren: 'src/collections/collections.module.ts'
  },
  {
    path: ':project/:collection',
    loadChildren: 'src/collection/collection.module.ts'
  },
  {
    path: ':project/:collection/subject/:subject',
    loadChildren: 'src/subject/subject.module.ts'
  },
  {
    path: ':project/:collection/subject/:subject/session/:session',
    loadChildren: 'src/session/session.module.ts'
  },
  {
    path: ':project/:collection/subject/:subject/session/:session/scan/:scan/volumes',
    loadChildren: 'src/volume/volume.module.ts'
  },
  {
    path: ':project/:collection/subject/:subject/session/:session/scan/:scan/volumes' +
          '/registration/:registration',
    loadChildren: 'src/volume/volume.module.ts'
  }
];

export const ROUTES: ModuleWithProviders = RouterModule.forRoot(ROUTE_CONFIG);
