import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { SessionService } from '../session/session.service.ts';
import { VolumeService } from './volume.service.ts';

const TEST_SESSION = {
  title: 'QIN_Test Breast Patient 1 Session 1',
  scans: [
    {
      number: 1,
      volumes:
        {
          name: 'NIFTI',
          images: [{name: 'volume001.nii.gz'}]
        }
    }
  ]
};

/**
 * The test mock for a `SessionService`.
 *
 * @module volume
 * @class VolumeSessionServiceStub
 */
class VolumeSessionServiceStub {
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
 * The {{#crossLink "VolumeService"}}{{/crossLink}} validator.
 *
 * @module volume
 * @class VolumeServiceSpec
 */
describe('The Volume service', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @param body {function(SubjectsComponent, SubjectService)} the test body
   * @private
   */
  function test(body) {
    return inject([VolumeService], (service: VolumeService) => {
      body(service);
    });
  }
  
  beforeEach(() => {
    // Note - supplying only the mock SessionService fails with the error:
    //     Cannot resolve all parameters for 'VolumeService'
    //   even though this is not true of the other analogous service.spec
    //   setups. The work-around is to hard-code the VolumeService provider
    //   as shown below.
    // TODO - revisit this with the production Angular release in 2017.
    addProviders([
      provide(SessionService, {useClass: VolumeSessionServiceStub}),
      {
        provide: VolumeService,
        useFactory: sessionService => new VolumeService(sessionService),
        deps: [SessionService]
      }
    ]);
  });

  it('should fetch the volume', test(service => {
    service.getVolume(
      {project: 'QIN_Test', collection: 'Breast', subject: 1, session: 1,
       scan: 1, volume: 1}
    )
      .subscribe(function (volume) {
          expect(volume, "The volume was not found").to.exist;
        }
      );
  }));
});
