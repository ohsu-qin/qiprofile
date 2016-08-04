/**
 * The Session Detail module.
 *
 * @module session
 * @main
 */
import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import Subject from '../subject/subject.data.coffee';
import Session from './session.data.coffee';
import { SessionService } from './session.service.ts';
import help from './session.help.md';

@Component({
  selector: 'qi-session',
  templateUrl: '/public/html/session/session.html',
  directives: [HomeComponent, ToggleHelpComponent, HelpComponent],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * The Session Detail page main component.
 *
 * @class SessionComponent
 */
export class SessionComponent {
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;

  /**
   * The session REST object.
   *
   * @property session {Object}
   */
  session: Object;
  
  /**
   * A fetch error.
   *
   * @property error {string}
   */
  error: string;
  
  constructor(
    private router: Router,
    route: ActivatedRoute,
    service: SessionService,
    changeDetector: ChangeDetectorRef
  ) {
    this.help = help;
    // The route/query parameters.
    let params = route.params.value;

    // Make a place-holder session sufficient to display a title.
    // The secondary key consists of the subject and the session number.
    this.session = service.secondaryKey(params);
    // Fill in enough of the session to display a title.
    Subject.extend(this.session.subject);
    Session.extend(this.session, this.session.subject, this.session.number);

    // Fetch the real session.
    service.getSession(params, true).subscribe(session => {
      if (session) {
        this.session = session;
      } else {
        this.error = `${ this.session.title } was not found`;
      }
      changeDetector.markForCheck();
    });
  }
}
