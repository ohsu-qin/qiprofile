/**
 * This application entry module declares the top-level
 * main {{#crossLink "AppComponent"}}{{/crossLink}} and
 * provides the following shared services:
 * * the REST resource providers
 * * {{#crossLink "HelpService"}}{{/crossLink}}
 * * {{#crossLink "SubjectService"}}{{/crossLink}}
 * * {{#crossLink "SessionService"}}{{/crossLink}}
 * * {{#crossLink "PapayaService"}}{{/crossLink}}
 *
 * These shared services are singletons and should not be
 * redundantly provided by the feature submodules.
 *
 * The page-level application feature modules are lazy-loaded.
 * These include the following:
 * * {{#crossLink "ProjectsModule"}}{{/crossLink}}
 * * {{#crossLink "CollectionsModule"}}{{/crossLink}}
 * * {{#crossLink "CollectionModule"}}{{/crossLink}}
 * * {{#crossLink "SubjectModule"}}{{/crossLink}}
 * * {{#crossLink "SessionModule"}}{{/crossLink}}
 * * {{#crossLink "VolumeModule"}}{{/crossLink}}
 *
 * @module main
 * @main main
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ResourceProviders } from 'ng2-resource-rest';

// The app root.
import { AppComponent } from './app.component.ts';

// The global services.
import { HelpService } from '../help/help.service.ts';
import { CollectionService } from '../collection/collection.service.ts';
import { SubjectService } from '../subject/subject.service.ts';
import { SessionService } from '../session/session.service.ts';
import { PapayaService } from '../image/papaya.service.ts';

// The shared utility modules.
import { ROUTES } from './app.routes.ts';

const SHARED_SERVICES = [
  HelpService, CollectionService, SubjectService, SessionService,
  PapayaService
];

@NgModule({
  imports: [BrowserModule, HttpModule, ROUTES],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [ResourceProviders.main(), ...SHARED_SERVICES]
})

/**
 * The global module metadata.
 *
 * @module main
 * @class AppModule
 */
export class AppModule { }