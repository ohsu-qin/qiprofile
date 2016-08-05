/**
 * The Collection Detail module.
 *
 * @module collection
 * @main collection
 */
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PAGE_DIRECTIVES } from '../main/page.ts';
import { SubjectService } from '../subject/subject.service.ts';
import { CollectionCorrelationsComponent } from './correlations.component.ts';
import help from './collection.help.md';

@Component({
  selector: 'qi-collection',
  templateUrl: '/public/html/collection/collection.html',
  directives: PAGE_DIRECTIVES.concat([CollectionCorrelationsComponent]),
  providers: []
})

/**
 * The Collection Detail main component.
 *
 * @class CollectionComponent
 */
export class CollectionComponent {
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;
  /**
   * A fetch error.
   *
   * @property error {string}
   */
  error: string;

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
   * @property subjects {Object[]}
   */
  subjects: Object[];
  
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
   *     [{'deltaKTrans', 'rcb'}, {'vE', 'tumorSize}]
   *
   * @property chartAxes {Object[]}
   */
  // TODO - get this from a user config on a per-user basis.
  chartConfigs: Object[];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private subjectService: SubjectService
  ) {
    this.help = help;
    this.chartConfigs = [
      {x: 'deltaKTrans', y: 'rcb'},
      {x: 'deltaKTrans', y: 'rcb'}
    ];
    let params = route.params.value;
    this.project = params.project;
    this.name = params.collection;
    subjectService.getSubjects(this.project, this.name).subscribe(subjects => {
      this.subjects = subjects;
    });
  }
  
  /**
   * Opens the Subect Detail page.
   *
   *
   * TODO - this belongs in the list pane item component.
   *
   * @method visitSubject
   * @param subject {Object} the subject REST object
   */
  visitSubject(subject) {
    this.subjectService.cache(subject);
    this.router.navigate(
      ['subject', subject.number],
      {relativeTo: this.route}
    );
  }
  
  /**
   * Opens the Volume Detail page.
   *
   *
   * TODO - this belongs in the list pane item component.
   *
   * @method visitSubject
   * @param volume {Object} the volume REST object
   */
  visitVolume(volume) {
    let session = volume.imageSequence.session;
    let subject = session.subject;
    this.subjectService.cache(subject);
    this.router.navigate(
      ['subject', subject.number, 'session', session.number, 'volume', number,
       {subjectid: subject._id}],
      {relativeTo: this.route}
    );
  }
}
