/**
 * The application configuration module.
 *
 * @module configuration
 */

import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import dataModel from './data-model.cfg';
import choices from './choices.cfg';

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

  /**
   * The choices configuration {topic: {database value: display value}}
   * object.
   *
   * @property choices
   */
  choices: Object;

  constructor() {
    this.dataModel = parse(dataModel);
    this.choices = parse(choices);
  }
}
