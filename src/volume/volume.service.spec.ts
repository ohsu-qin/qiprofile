import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { SessionService } from '../session/session.service.ts';
import { VolumeService } from './volume.service.ts';

const TEST_SESSION = {
  title: 'QIN_Test Breast Patient 1 Session 1',
  encounters: [
    {
      _cls: 'Session',
      scans: [
        {
          number: '1',
          volumes:
          {
            name: 'NIFTI',
            images: [{name: 'volume001.nii.gz'}]
          }
        }
      ]
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
 * FIXME - fails with error:
 *    Cannot resolve all parameters for 'VolumeService'
 *  even though this is not true of the other analogous service.spec setups. 
 *
 * @module volume
 * @class VolumeServiceSpec
 */
xdescribe('The Volume service', function() {
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
    addProviders([
      VolumeService,
      provide(SessionService, {useClass: VolumeSessionServiceStub}),
    ]);
  });

  it('should fetch the volume', test(service => {
    service.getVolume({project: 'QIN_Test', collection: 'Breast', subject: 1, volume: 1})
      .subscribe(function (volume) {
          expect(volume, "The volume was not found").to.exist;
        }
      );
  }));
});
