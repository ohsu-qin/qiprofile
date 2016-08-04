/**
 * The Subject module.
 *
 * @module subject
 * @main
 */
import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import Subject from './subject.data.coffee';
import { SubjectService } from './subject.service.ts';
import help from './subject.help.md';

@Component({
  selector: 'qi-subject',
  templateUrl: '/public/html/subject/subject.html',
  directives: [HomeComponent, ToggleHelpComponent, HelpComponent],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * The Subject main component.
 *
 * @class SubjectComponent
 */
export class SubjectComponent {
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;

  /**
   * The subject to display.
   *
   * @property subject {Object}
   */
  subject: Object;
  
  /**
   * A fetch error.
   *
   * @property error {string}
   */
  error: string;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    service: SubjectService,
    changeDetector: ChangeDetectorRef
  ) {
    this.help = help;
    // The route/query parameters.
    let params = this.route.params.value;

    // A place-holder subject sufficient to get a title.
    this.subject = service.secondaryKey(params);
    Subject.extend(this.subject);

    // Fetch the real subject.
    service.getSubject(params).subscribe(subject => {
      if (subject) {
        this.subject = subject;
      } else {
        this.error = `${ this.subject.title } was not found`;
      }
      changeDetector.markForCheck();
    });
  }
  
  /**
   * Opens the Session Detail page.
   *
   *
   * TODO - this belongs in the list pane item component.
   *
   * @method visitSession
   * @param session {Object} the session REST object
   */
  visitSession(session) {
    this.router.navigate(
      ['session', session.number],
      {relativeTo: this.route}
    );
  }
}
