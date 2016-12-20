import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { SessionService } from '../session/session.service.ts';
import { ImageSequenceService } from './image-sequence.service.ts';

const TEST_SESSION = {
  title: 'QIN_Test Breast Patient 1 Session 1',
  scans: [
    {
      number: 1,
      imageSequences:
        {
          name: 'NIFTI',
          images: [{name: 'imageSequence001.nii.gz'}]
        }
    }
  ]
};

/**
 * The test mock for a `SessionService`.
 *
 * @module imageSequence
 * @class ImageSequenceSessionServiceStub
 */
class ImageSequenceSessionServiceStub {
  /**
   * @method getSession
   * @param params {Object} the route parameters
   * @return {Observable<any>} the hard-coded session object
   */
  getSession(params: Object, detail=true): Observable<any> {
    return Observable.of(TEST_SESSION);
  }
}

/**
 * The {{#crossLink "ImageSequenceService"}}{{/crossLink}} validator.
 *
 * @module imageSequence
 * @class ImageSequenceServiceSpec
 */
describe('The ImageSequence service', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @param body {function(SubjectsComponent, SubjectService)} the test body
   * @private
   */
  function test(body) {
    return inject([ImageSequenceService], (service: ImageSequenceService) => {
      body(service);
    });
  }
  
  beforeEach(() => {
    // Note - supplying only the mock SessionService fails with the error:
    //     Cannot resolve all parameters for 'ImageSequenceService'
    //   even though this is not true of the other analogous service.spec
    //   setups. The work-around is to hard-code the ImageSequenceService provider
    //   as shown below.
    // TODO - revisit this with the production Angular release in 2017.
    addProviders([
      provide(SessionService, {useClass: ImageSequenceSessionServiceStub}),
      {
        provide: ImageSequenceService,
        useFactory: sessionService => new ImageSequenceService(sessionService),
        deps: [SessionService]
      }
    ]);
  });

  it('should fetch the imageSequence', test(service => {
    service.getImageSequence(
      {project: 'QIN_Test', collection: 'Breast', subject: 1, session: 1, scan: 1}
    )
      .subscribe(function (imageSequence) {
          expect(imageSequence, "The imageSequence was not found").to.exist;
        }
      );
  }));
});
