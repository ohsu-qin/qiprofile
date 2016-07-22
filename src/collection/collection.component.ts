/**
 * The Collection Detail module.
 *
 * @module collection
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { SubjectService } from '../subject/subject.service.ts';
import {
  CollectionCorrelationComponent
} from './collection-correlation.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import { HelpService } from '../help/help.service.ts';
import help from './collection.help.md';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collection',
  templateUrl: '/public/html/collection/collection.html',
  directives: [HomeComponent, ToggleHelpComponent,
               CollectionCorrelationComponent, HelpComponent],
  providers: [SubjectService]
})

/**
 * The Collection Detail main component.
 *
 * @class CollectionComponent
 * @main
 */
export class CollectionComponent implements OnInit {
  /**
   * The project name.
   *
   * @property project {string}
   */
  project: string;
  
  /**
   * The collection name.
   *
   * @property name {string}
   */
  name: string;
  
  /**
   * The required initial chart configuration specification objects.
   * Each specification contains the following properties:
   *
   * * `x` - the X axis data accessor property naem
   * * `y` - the Y axis data accessor property name
   *
   * There is one specification object per chart.
   *
   * @example
   * [{'deltaKTrans', 'rcb'}, {'vE', 'tumorSize}]
   *
   * @property chartAxes {Object[]}
   */
  // TODO - get this from a user config on a per-user basis.
  chartConfigs: Object[];
  
  /**
   * The subject REST objects.
   *
   * @property subjects {Observable<Object[]>}
   */
  subjects: Observable<Object[]>;
  
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;
  
  constructor(private route: ActivatedRoute,
              private dataService: SubjectService,
              private helpService: HelpService) {
      this.help = help;
      this.chartConfigs = [
        {x: 'deltaKTrans', y: 'rcb'}
      ];
      this.data = [12, 8, 13, 24];
  }
  
  /**
   * Obtains the REST Subject objects from the data service.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    // When the route settles, fetch the subjects.
    this.route.params.subscribe(params => {
      this.project = params.project;
      this.collection = params.collection;
      // The subject REST objects.
      this.subjects = this.dataService.getSubjects(
        this.project, this.collection
      );
    });
  }
}
