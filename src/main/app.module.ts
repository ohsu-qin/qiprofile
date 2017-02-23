/**
 * This application entry module declares the top-level
 * main {{#crossLink "AppComponent"}}{{/crossLink}} and
 * provides the following shared services:
 * * the REST resource providers
 * * {{#crossLink "HelpService"}}{{/crossLink}}
 * * {{#crossLink "ConfigurationService"}}{{/crossLink}}
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
// Angular forms is broken; cf. controls/cascade-select.pug.
//import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ResourceProviders } from 'ng2-resource-rest';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// The app root.
import { AppComponent } from './app.component.ts';

// The app routes.
import { ROUTES } from './app.routes.ts';

// The global services.
import { HelpService } from '../help/help.service.ts';
import { ConfigurationService } from '../configuration/configuration.service.ts';
import { ProjectsService } from '../projects/projects.service.ts';
import { CollectionsService } from '../collections/collections.service.ts';
import { SubjectService } from '../subject/subject.service.ts';
import { SessionService } from '../session/session.service.ts';
import { PapayaService } from '../image/papaya.service.ts';

const SHARED_SERVICES = [
  HelpService, ConfigurationService, CollectionsService, ProjectsService,
  SubjectService, SessionService, PapayaService
];

@NgModule({
  imports: [BrowserModule, HttpModule, NgbModule.forRoot(), ROUTES],
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
