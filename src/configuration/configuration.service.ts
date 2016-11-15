/**
 * The application configuration module.
 *
 * @module configuration
 */

import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import dataModel from './data-model.cfg';
import valueChoices from './value-choices.cfg';
import preferences from './preferences.cfg';

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
   * @property dataModel {Object}
   */
  dataModel: Object;

  /**
   * The preferences configuration object.
   *
   * @property preferences {Object}
   */
  preferences: Object;

  /**
   * The choices configuration {path: {value: label}} object,
   * where *path* is the property select choice path.
   *
   * @property valueChoices {Object}
   */
  valueChoices: Object;

  constructor() {
    this.dataModel = parse(dataModel);
    this.preferences = parse(preferences);
    this.valueChoices = parse(valueChoices);
  }
}
