/**
 * The application configuration module.
 *
 * @module configuration
 */

import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import correlation from './correlation.cfg';

@Injectable()

/**
 * The application configuration service.
 *
 * @class ConfigurationService
 */
export class ConfigurationService {
  /**
   * The correlation configuration {topic: {label: path}}
   * object.
   *
   * @property correlation
   */
  correlation: Object;

  constructor() {
    // TODO - merge an admin-defined server file path.
    this.correlation = parse(correlation);
  }
}
