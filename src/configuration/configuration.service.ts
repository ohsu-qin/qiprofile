/**
 * The application configuration module.
 *
 * @module configuration
 */

import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import dataModel from './data-model.cfg';

@Injectable()

/**
 * The application configuration service.
 *
 * @class ConfigurationService
 */
export class ConfigurationService {
  /**
   * The data model configuration {topic: {label: path}}
   * object.
   *
   * @property dataModel
   */
  dataModel: Object;

  constructor() {
    // TODO - merge an admin-defined server file path.
    this.dataModel = parse(dataModel);
  }
}
