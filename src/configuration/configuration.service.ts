/**
 * The application configuration module.
 *
 * @module configuration
 */

import * as _s from "underscore.string";
import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import labels from './labels.cfg';

@Injectable()

/**
 * The application configuration service.
 *
 * @class ConfigurationService
 */
export class ConfigurationService {
  /**
   * The parsed labels configuration.
   *
   * @property labels
   */
  labels: Object;

  constructor() {
    this.labels = parse(labels);
  }
  
  /**
   * Determines the label for the given attribute, as follows:
   * * If there is an entry for the attribute in the `labels.cfg`
   *   file, then that configuration entry value is the label
   * * Otherwise, the label is the capitalized, space-separated
   *   parse of the attribute, e.g. `tumorSize` => `Tumor Size`.
   *
   * The label look-up can be qualified by the configuration
   * file section. If the section is not supplied, then all
   * sections are checked.
   *
   * @method getLabel
   * @param {string} attribute
   * @param {string} the optional label config section, e.g. `Modeling`
   * @return {string} the attribute label
   */
  getLabel(attribute: string, section?: string): string {
    if (section) {
      section = _.capitalize(section);
      let label = this.labels[section][attribute];
      if (label) { return label; }
      } else {
      for (let _section in this.labels) {
        let label = this.labels[_section][attribute];
        if (label) { return label; }
      }
    }
    return this.defaultLabelFor(attribute);
  }
  
  private defaultLabelFor(attribute: string): string {
    return _s.humanize(attribute).split(' ').map(_s.capitalize).join(' ');
  }
}
