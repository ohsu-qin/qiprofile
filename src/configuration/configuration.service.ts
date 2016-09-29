/**
 * The application configuration module.
 *
 * @module configuration
 */

import * as _s from "underscore.string";
import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import labels from './labels.cfg';
import properties from './properties.cfg';

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

  /**
   * The parsed properties configuration.
   *
   * @property properties
   */
  properties: Object;

  constructor() {
    // TODO - merge an admin-defined server file path.
    this.labels = parse(labels);
    this.properties = parse(properties);
  }

  /**
   * Returns the properties and property paths listed in
   * the properties configuration under the given topic.
   *
   * @method getProperties
   * @param topic {string} the topic to search
   * @return {string[]} the topic properties, or null if none
   */
  getProperties(topic: string) {
    return this.properties[topic];
  }

  /**
   * Determines the label for the given property as follows:
   * * If there is an entry for the property within the topic, then
   *   that configuration entry value is the label.
   * * Otherwise, the label is the capitalized, space-separated
   *   "humanized" parse of the property or property path, e.g.
   * `tumorSize` => `Tumor Size`.
   *
   * The label match is applied element-wise in the property path,
   * e.g. if there is a `[Pathology]` `tnm = TNM` entry, then the
   * label for path `tnm.tumorSize` in section `Pathology` is
   * `TNM Tumor Size`.
   *
   * @method getLabel
   * @param property {string} the property name or path
   * @param topic {string} the required configuration topic
   * @return {string} the property label
   */
  getLabel(property: string, topic: string): string {
    let path = property.split('.');
    let labelize = s => this.getAtomicLabel(s, topic);

    return path.map(labelize).join(' ');
  }

  /**
   * Returns the label of the given simple property name as
   * described in
   * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}}.
   *
   * @method getAtomicLabel
   * @private
   * @param property {string} the property name
   * @param topic {string} the configuration topic
   * @return {string} the property label
   */
  private getAtomicLabel(property: string, topic: string): string {
    let section = this.labels[topic];
    let configLabel = section ? section[property] : null;

    return configLabel || this.defaultLabel(property);
  }

  /**
   * Returns the default property label as described in
   * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}}.
   *
   * @method defaultLabel
   * @private
   * @param property {string} the property name
   * @return {string} the default property label
   */
  private defaultLabel(property: string): string {
    // The humanized uncapitalized array.
    let lc = _s.humanize(property).split(' ');

    return lc.map(_s.capitalize).join(' ');
  }
}
