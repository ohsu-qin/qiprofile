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
  CollectionCorrelationsComponent
} from './collection-correlations.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import help from './collection.help.md';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collection',
  templateUrl: '/public/html/collection/collection.html',
  directives: [HomeComponent, ToggleHelpComponent,
               CollectionCorrelationsComponent, HelpComponent],
  providers: [SubjectService]
})

/**
 * The Collection Detail main component.
 *
 * @class CollectionComponent
 */
export class CollectionComponent implements OnInit {
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;

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
   * The subject REST objects.
   *
   * @property subjects {Observable<Object[]>}
   */
  subjects: Observable<Object[]>;
  
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
  
  constructor(private route: ActivatedRoute,
              private dataService: SubjectService) {
    this.help = help;
    this.chartConfigs = [
      {x: 'deltaKTrans', y: 'rcb'},
      {x: 'deltaKTrans', y: 'rcb'}
    ];
    let params = this.route.params.value;
    this.project = params.project;
    this.name = params.collection;
    this.subjects = this.dataService.getSubjects(this.project, this.name);
  }
}
