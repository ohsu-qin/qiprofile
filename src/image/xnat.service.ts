import { Injectable } from '@angular/core';

import { FileService } from '../file/file.service.ts';
import XNAT from './xnat.coffee';

@Injectable()

/** The XNAT loader service.
 *
 * @class XNATService
 */
export class XNATService {
  constructor(private fileService: FileService) {}

  /**
   * Loads the image file content.
   *
   * @method load
   * @param image {string} the image object
   * @return {Observable<ArrayBuffer>} an observable which
   *   resolves to the loaded image file content
   */
  load(image: string) {
    // The image file path.
    let path: string = XNAT.location(image);
    // Read the file into an ArrayBuffer.
    return this.fileService.readBinary(path);
  }
}
