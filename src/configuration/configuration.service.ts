/**
 * The application configuration module.
 *
 * @module configuration
 */

import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import config from '../conf/qiprofile.cfg';

@Injectable()

/**
 * The application configuration service.
 *
 * @class ConfigurationService
 */
export class ConfigurationService {
  /**
   * The parsed configuration.
   *
   * @property configuration
   */
  configuration: Object;

  constructor() {
    this.configuration = parse(config);
  }
}
