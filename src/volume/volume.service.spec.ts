import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { ImageSequenceService } from '../session/image-sequence.service.ts';
import { VolumeService } from './volume.service.ts';

const MAX_INTENSITY_VOLUME = {name: 'volume003.nii.gz', averageIntensity: 2.6};
const TEST_SCAN = {
  title: 'QIN_Test Breast Patient 1 Session 1 Scan 1',
  number: 1,
  volumes: {
    name: 'NIFTI',
    images: [
      {name: 'volume001.nii.gz', averageIntensity: 2.4},
      {name: 'volume002.nii.gz', averageIntensity: 2.1},
      MAX_INTENSITY_VOLUME
    ]
  },
  maximalIntensityVolume: () => MAX_INTENSITY_VOLUME
};

/**
 * The test mock for an
 * {{#crossLink "ImageSequenceService"}}{{/crossLink}}.
 *
 * @module volume
 * @class VolumeImageSequenceServiceStub
 */
class VolumeImageSequenceServiceStub {
  /**
   * @method getImagSequence
   * @param params {Object} the route parameters
   * @return {Observable<any>} the hard-coded image sequence object
   */
  getImageSequence(params: Object, detail=true): Observable<any> {
    return Observable.of(TEST_SCAN);
  }
}

/**
 * The {{#crossLink "VolumeService"}}{{/crossLink}} validator.
 *
 * @module volume
 * @class VolumeServiceSpec
 */
describe.only('The Volume service', function() {
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
      provide(ImageSequenceService, {useClass: VolumeImageSequenceServiceStub}),
      VolumeService
    ]);
  });

  it('should fetch the volume', test(service => {
    service.getVolume(
      {project: 'QIN_Test', collection: 'Breast', subject: '1', session: '1',
       scan: '1', volume: '1'}
    )
      .subscribe(function (volume) {
        const expected = TEST_SCAN.volumes.images[0];
        expect(volume, "The volume was not found").to.exist;
        expect(volume, "The volume was not found").to.equal(expected);
    });
  }));

  it('should fetch the maximal intensity volume by default', test(service => {
    service.getVolume(
      {project: 'QIN_Test', collection: 'Breast', subject: '1', session: '1',
       scan: '1'}
    )
      .subscribe(function (volume) {
        expect(volume, "The volume was not found").to.exist;
        expect(volume, "The volume was not found")
          .to.equal(MAX_INTENSITY_VOLUME);
    });
  }));

  it('should find the volume', test(service => {
    let expected = TEST_SCAN.volumes.images[0];
    let actual = service.findVolume(TEST_SCAN, 1);
    expect(actual, "The volume was not found").to.equal(expected);
  }));
});
