import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ImageSequenceService } from '../session/image-sequence.service.ts';
import Volume from './volume.data.coffee';

@Injectable()

/**
 * The volume data access service.
 *
 * @class VolumeService
 */
export class VolumeService {

  constructor(private sequenceService: ImageSequenceService) {}

  /**
   * Makes the {_sequence_, _number_} secondary
   * key from the given route parameters, where:
   * * _sequence_ is the parent image sequence secondary key
   * * _number_ is the _volume_ parameter
   * The image sequence secondary key is the scan or registration
   * number and the sequence parent secondary key, recursively
   * defined up to the subject secondary key.
   *
   * @example
   *     {
   *       scan: {
   *         session: {
   *           subject: {project: 'QIN', collection: 'Breast', number: 4},
   *           number: 3
   *         },
   *         number: 1
   *       },
   *       number: 12
   *     }
   *
   * @method secondaryKey
   * @param params {Object} the route parameters
   * @return {Object} the corresponding secondary key
   */
  secondaryKey(routeParams: Object) {
    // The subject secondary key.
    let session = this.sequenceService.secondaryKey(routeParams);
    let scan = {session: session, number: +routeParams.scan};
    // The volume number.
    let volume = +routeParams.volume;
    // The parent is either the scan or a registration.
    let regParam = routeParams.registration;
    if (regParam) {
      return {registration: {scan: scan, number: +regParam}, number: volume};
    } else {
      return {scan: scan, number: volume};
    }
  }

  /**
   * Makes a place-holder volume sufficient to display a title.
   * The place-holder extends the
   * {{#crossLink "VolumeService/secondaryKey"}}{{/crossLink}}
   * using the various data utility service `extend` methods,
   * which in turn enables the {{#crossLink "Volume/title"}}{{/crossLink}}
   * virtual property.
   *
   * @method placeHolder
   * @param routeParams {Object} the route parameters
   * @return {Volume} the place-holder volume object
   */
  placeHolder(routeParams: Object) {
    // The parent place-holder object.
    let imageSequence = this.sequenceService.placeHolder(routeParams);
    // The volume number is the volume route parameter.
    let volumeNbr = +routeParams.volume;
    // Extend an empty volume object with the image sequence
    // parent reference and the volume number.
    let volume = {};
    Volume.extend(volume, imageSequence, volumeNbr);

    return volume;
  }

  /**
   * @method getVolume
   * @param routeParams {Object} the route parameters
   * @return {any} the REST volume image object, or null if not found
   */
  getVolume(routeParams: Object): Observable<any> {
    // The image sequence.
    let sequenceFinder = this.sequenceService.getImageSequence(routeParams);

    // Find the volume.
    let volumeNbr = routeParams.volume;
    return sequenceFinder.map(
      imageSequence => imageSequence ? this.findVolume(imageSequence, volumeNbr) : imageSequence
    );
  }

  /**
   * Finds the volume in the given image sequence.
   * The default volume is the
   * {{#crossLink "ImageSequence/maximalIntensityVolume"}}{{/crossLink}}.
   *
   * @method findVolume
   * @param imageSequence {Object} the image sequence object holding the volume
   * @param volume {number} the optional one-based volume number
   * @return {any} the REST volume image object, or null if not found
   */
  findVolume(imageSequence: Object, volume?: number) {
    // The volumes object holds the volume images array.
    let volumes = imageSequence.volumes;
    if (!volumes || !volumes.images) {
      return null;
    }

    // Return the indicated volume.
    if (!_.isNil(volume)) {
      // Allow for a string volume, e.g. from the route.
      let volumeNbr = +volume;
      // The number is one-based.
      if (volumeNbr === 0) {
        throw new RangeError("The volume number cannot be zero");
      }
      // The volume index is one less than the volume number.
      let volNdx = volume - 1;
      return volumes.images[volNdx];
    } else {
      let maxVol = imageSequence.maximalIntensityVolume();
      return maxVol ? maxVol : volumes.images[0];
    }
  }
}
