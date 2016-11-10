/**
 * The application configuration module.
 *
 * @module configuration
 */

import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import dataModel from './data-model.cfg';
import choices from './choices.cfg';
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
   * The choices configuration {topic: {database value: display value}}
   * object.
   *
   * @property choices {Object}
   */
  choices: Object;

  constructor() {
    this.dataModel = parse(dataModel);
    this.preferences = parse(preferences);
    this.choices = parse(choices);
  }
}
