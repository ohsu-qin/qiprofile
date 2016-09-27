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
   * * If the topic is provided, then the label is looked up
   *   in the `labels.cfg` file.
   * * Otherwise, the right-most item in the property path with
   *   a comparable topic in `labels.cfg` is used, e.g. if
   *   the path is `subject.biopsy.pathology.tnm.tumorSize`
   *   then a `[Pathology]` topic would scope the subpath
   *  `tnm.tumorSize`.
   * * If no topic could be determined, then all topics in
   *   the configuration file are consulted.
   *
   * The label match for a given topic is determined as follows:
   * * If there is an entry for the property within the topic, then
   *   that configuration entry value is the label.
   * * Otherwise, the label is the capitalized, space-separated
   *   lookup of each item in the property path, e.g.
   * * If there is no configuration match, then the default is
   *   the capitalized, space-separated "humanized" parse of the
   *   property, e.g. `tumorSize` => `Tumor Size`.
   *
   * The label match is applied element-wise in the property path,
   * e.g. if there is a `[Pathology]` `tnm = TNM` entry, then the
   * label for path `subject.biopsy.pathology.tnm.tumorSize` is
   * `TNM Tumor Size`.
   *
   * @method getLabel
   * @param property {string} the property name
   * @param topic {string} the optional configuration topic
   * @return {string} the property label
   */
  getLabel(property: string, topic?: string): string {
    let path = property.split('.');
    if (topic) {
      return this.getPathLabel(path, topic);
    } else {
      let caps = path.map(_.s.capitalize);
      let topicNdx = _.findLastIndex(caps, s => s in this.labels);
      if (topicNdx === -1) {
        return getPathLabel(path);
      } else {
        let prefix = _.take(caps, topicNdx + 1).join(' ');
        topic = caps[topicNdx];
        let subpath = path.slice(topicNdx + 1).join('.');
        let suffix = this.getPathLabel(subpath, topic);
        return `${ prefix } ${ suffix }`;
      }
    }
  }

  private getPathLabel(path: string[], topic?: string): string {
    // If no topic given, then check all topics.
    let topics = topic ? [topic] : this.labels.keys();
    let labels = path.map(prop => this.getConfigLabel(prop, topics));

    return labels.join(' ');
  }

  private getConfigLabel(property: string, topics: string[]): string {
    // Look in each relevant topic for the label.
    for (topic in topics) {
      let label = this.labels[topic][property];
      if (label) {
        return label;
      }
    }
    // Not found: make the default label.
    return this.defaultLabel(property);
  }

  /**
   * Returns the default property label as described in
   * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}}.
   *
   * @method defaultLabel
   * @param {string} the property name
   * @return {string} the default property label
   */
  private defaultLabel(property: string): string {
    return _s.humanize(property).split(' ').map(_s.capitalize).join(' ');
  }
}
