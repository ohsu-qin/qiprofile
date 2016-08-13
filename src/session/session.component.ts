/**
 * The Session Detail module.
 *
 * @module session
 * @main session
 */
import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PageComponent } from '../page/page.component.ts';
import Subject from '../subject/subject.data.coffee';
import Session from './session.data.coffee';
import { SessionService } from './session.service.ts';
import help from './session.help.md';

@Component({
  selector: 'qi-session',
  templateUrl: '/public/html/session/session.html',
  directives: PageComponent.DIRECTIVES,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * The Session Detail page main component.
 *
 * @class SessionComponent
 */
export class SessionComponent extends PageComponent {
  /**
   * The session REST object.
   *
   * @property session {Object}
   */
  session: Object;
  
  /**
   * The project name.
   *
   * @property project {string}
   */
  get project(): string {
    return this.session ? this.session.subject.project : null;
  }
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    service: SessionService,
    changeDetector: ChangeDetectorRef
  ) {
    super(help);
    
    // The route/query parameters.
    let params = route.params.value;
    
    // Make a place-holder session sufficient to display a title.
    // The secondary key consists of the subject and the session number.
    this.session = service.secondaryKey(params);
    // Fill in enough of the session to display a title.
    Subject.extend(this.session.subject);
    Session.extend(this.session, this.session.subject, this.session.number);
    
    // Fetch the session.
    service.getSession(params, true).subscribe(session => {
      if (session) {
        this.session = session;
      } else {
        this.error = `${ this.session.title } was not found`;
      }
      changeDetector.markForCheck();
    });
  }
  
  /**
   * Opens the Volume Detail page.
   *
   * @method visitVolume
   * @param volume {Object} the volume REST object
   */
  visitVolume(volume) {
    let scan = volume.scan;
    this.router.navigate(
      ['scan', scan.number, 'volume', volume.number],
      {relativeTo: this.route}
    );
  }
}
