/**
 * The application configuration module.
 *
 * @module configuration
 * @main configuration
 */

import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { parse } from 'ini-parser';

import StringHelper from '../string/string-helper.coffee';
import dataModelInput from './data-model.cfg';
import valueChoicesInput from './value-choices.cfg';
import preferencesInput from './preferences.cfg';

@Injectable()

/**
 * The application configuration service.
 *
 * @class ConfigurationService
 */
export class ConfigurationService {
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

  /**
   * The data model configuration object. This input is
   * parsed into the
   * {{#crossLink "ConfigurationService/labelLookup:property"}}{{/crossLink}}
   * for use by
   * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}}.
   *
   * @property dataModel {Object}
   */
  dataModel: Object;

  /**
   * The application data model configuration object built
   * from the `data_model.cfg` input file. The input file
   * topics are conceptual objects. The input sections
   * assign a property path to a label, e.g. the section:
   *
   *     [Demographics]
   *     Age = age
   *
   * specifies that a Demographics object has the property
   * *age* with display label `Age`.
   *
   * A topic can be parameterized by a qualifier, e.g. the topic:
   *
   *     [Pathology<Breast>]
   *
   * pertains only to the `Breast` qualifier. Only topics
   * can be parameterized.
   *
   * The property value `this` is a logical aggregation, e.g.
   * the section:
   *
   *     [RCB]
   *     RCB Summary = this
   *     RCB Detail = this
   *
   * groups the RCB object into two logical aggregations.
   *
   * An atomic property entry, i.e. an entry that does not
   * refer to another topic, can be annotated by an HTML label,
   * e.g. the entry:
   *
   *     tau_i = tauI (&tau;<sub>i</sub>)
   *
   * specifies that the *tauI* property has text label `tau_i`
   * with HTML representation &tau;<sub>i</sub>.
   *
   * The file is parsed into this
   * {{#crossLink "ConfigurationService/dataModel:property"}}{{/crossLink}}.
   * The parsed object consists of {context: config} properties,
   * where *context* is `common` for the shared data model or a
   * parameterized qualifier as described above, and *config*
   * is the parsed configuration for that context.
   *
   * Each parsed configuration is a
   * {topic: {property: {_label, child...}}}
   * associative label lookup object, where *_label* is a
   * {`text`, `html`} label object and *child* is a child
   * property.
   *
   * Every object has a label but only non-atomic properties
   * have child properties. This sets up the convenient label
   * lookup configs for the common and extension configurations
   * as sketched in the following function:
   *
   *     (topic, path) => _.get(config, `${topic}.${path}.${_label}`)
   *
   * @example
   *     [Clinical]
   *     Demographics = subject
   *     Biopsy = subject.biopsy
   *
   *     [Demographics]
   *     Age = age
   *
   *     [Biopsy]
   *     Pathology = pathology
   *
   *     [Pathology]
   *     PrimaryTumor = tumors[0]
   *
   *     [PrimaryTumor]
   *     TNM = tnm
   *
   *     [PrimaryTumor<Breast>]
   *     RCB = rcb
   *
   *     [TNM]
   *     TNM Size = size.tumorSize
   *     ...
   *
   *  is parsed to:
   *
   *     {
   *       common:
   *         subject: {
   *           _label: {text: 'Demographics'},
   *           age: {_label: {text: 'Age'}},
   *           biopsy: {
   *             _label: {text: 'Biopsy'},
   *             pathology: {
   *               _label: {text: 'Pathology'},
   *               tumors: [
   *                 {
   *                   _label: {text: 'Primary Tumor'},
   *                   tnm: {
   *                     _label: {text: 'TNM'},
   *                     size: {
   *                       tumorSize: {_label: {text: 'TNM Size'}},
   *                       ...
   *                     }
   *                   }
   *                 }
   *               ]
   *             }
   *           }
   *         }
   *       }
   *       Breast: {
   *         ... // same as common with the following exception:
   *                 tumors: [
   *                   {
   *                     _label: ...
   *                     tnm: ...
   *                     rcb: ...   // <== breast-specific
   *       }
   *     }
   *
   * This example has a parameterized extension `Breast`
   * which augments the common configuration with breast
   * patient specializations. Note that each section topic
   * and section entry parses to a `_label property, but
   * the atomic property items only contain this `_label`
   * property. Label lookups are then a matter of calling
   * the lodash `_get` function with an augmented property
   * path. For example, the path:
   *
   *     common.Clinical.subject.biopsy.pathology.tumors[0].tnm.size.tumorSize._label.text
   *
   * resolves to `TNM Size` as described in
   * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}}.
   *
   * Note that an array index is supported, e.g. `tumors[0]`
   * in the above example.
   *
   * @property dataModel {Object}
   */
  get labelLookup(): Object {
    // Parse on demand.
    if (!this._labelLookup) {
      this._labelLookup = this.parseDataModel();
    }
    return this._labelLookup;
  }

  /**
   * The parsed
   * {{#crossLink "ConfigurationService/dataModel:property"}}{{/crossLink}}
   * configuration object built on demand.
   *
   * @property _labelLookup {Object}
   * @private
   */
  private _labelLookup: Object;

  constructor() {
    this.preferences = parse(preferencesInput);
    this.valueChoices = parse(valueChoicesInput);
    this.dataModel = parse(dataModelInput);
  }

  /**
   * Returns the HTML label for the given display property.
   * The HTML label is determined as described in
   * {{#crossLink "ConfigurationService/getTextLabel"}}{{/crossLink}},
   * with the following difference:
   * * If the label lookup search returns a matching {text, html} label
   *   object and has a *html* value, then that value is returned.
   *
   * @method getHTMLLabel
   * @param property {string} the property path
   * @param config {string} the optional parameterized extension
   * @return {string} the display HTML label
   */
  getHTMLLabel(property: string, config?: string) {
    let target = this.getLabelObject(property, config);
    if (target) {
      return target.html || target.text;
    } else {
      return this.defaultLabel(property);
    }
  }

  /**
   * Returns the HTML label for the given display property.
   * The text label is determined as follows:
   * * If the label lookup search returns a matching {text, html}
   *   label object, then the *text* value is returned.
   * * If the search fails, then this method delegates to
   *   {{#crossLink "ConfigurationService/defaultLabel"}}{{/crossLink}}.
   *
   * @method getTextLabel
   * @param property {string} the property path
   * @param config {string} the optional parameterized extension
   * @return {string} the display text label
   */
  getTextLabel(property: string, config?: string) {
    let target = this.getLabelObject(property, config);
    if (target) {
      return target.text;
    } else {
      return this.defaultLabel(property);
    }
  }

  /**
   * Returns the {text, html} label object for the given display property.
   * The label is searched as described in
   * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}}.
   *
   * If the label lookup search returns a matching {text, html} label object, then
   * the *html* value is returned, if it exists, otherwise the
   * *text* value is returned. If the search fails, then this method
   * delegates to
   * {{#crossLink "StringHelper/labelize"}}{{/crossLink}}.
   *
   * @method getLabel
   * @param property {string} the property path
   * @param config {string} the optional parameterized extension
   * @return {Object} the configured label object, if it exists,
   *   otherwise `undefined`
   */
  private getLabelObject(property: string, config?: string) {
    // The default config is common.
    if (!config || !(config in this.labelLookup)) {
      config = 'common';
    }
    // Augment the property path.
    let path = `${ config }.${ property }._label`;

    return _.get(this.labelLookup, path);
  }

  /**
   * If the label path contains `normalizedAssay`, then
   * this method delegates to
   * {{#crossLink "StringHelper/labelize"}}{{/crossLink}}
   * called on the terminal property name in the *property*
   * path.
   *
   * @method defaultLabel
   * @private
   * @param property {string} the property path
   * @return {string} the target label
   */
  private defaultLabel(property: string): string {
    const ASSAY = 'normalizedAssay';
    let last = _.last(property.split('.'));
    if (_.includes(property, ASSAY)) {
      return this.defaultGenomicsLabel(last);
    } else {
      return StringHelper.labelize(last);
    }
  }

  /**
   * Returns the label for the given genomics property.
   * This method specializes
   * {{#crossLink "ConfigurationService/defaultLabel"}}{{/crossLink}}
   * for a property name of length six or less to upper-case.
   *
   * @example
   *     'er'  => 'ER'
   *     'scube2'  => 'SCUBE2'
   *     'survivin'  => 'Survivin'
   *
   * @method defaultGenomicsLabel
   * @private
   * @param property {string} the property name (not path)
   * @return {string} the default label
   */
  private defaultGenomicsLabel(property: string): string {
    if (property.length < 7) {
      return property.toUpperCase();
    } else {
      return StringHelper.labelize(property);
    }
  }

  /**
   * Converts the data model configuration input file into
   * the configuration object as described in
   * {{#crossLink "ConfigurationService/labelLookup:property"}}{{/crossLink}}.
   *
   * @method parseDataModel
   * @private
   * @return {Object} the parsed data model object
   */
  private parseDataModel() {
    // Convert {key: value} to {property: {_label}} for an
    // atomic property, {property: key} otherwise.
    let accumSwizzled = (accum, value, key) => {
      // Parse the entry.
      let [prop, html] = this.parseDataModelValue(value, key);
      if (key in this.dataModel) {
        if (prop === 'this') {
          let aggregation = this.dataModel[key];
          let aggregate = _.partial(accumSwizzled, accum);
          _.forEach(aggregation, aggregate);
        } else {
          let path = `${ prop }._include`;
          _.set(accum, path, key);
        }
      } else {
        // The atomic property target is the label.
        let target = {_label: {text: key, html: html}};
        _.set(accum, prop, target);
      }
    };
    let swizzle = section => _.transform(section, accumSwizzled, {});
    let swizzled = _.mapValues(this.dataModel, swizzle, {});

    // Separate the common data model from the parameterized
    // extensions.
    let common = {};
    let extensions = {};
    // Partition the input configuration into the common and
    // extension configurations.
    let partition = (section, topic) => {
      let [baseTopic, qualifier] = this.parseDataModelKey(topic);
      if (qualifier) {
        let extension = extensions[qualifier];
        if (!extension) {
          extension = extensions[qualifier] = {};
        }
        extension[baseTopic] = section;
      } else {
        common[topic] = section;
      }
    };
    _.forEach(swizzled, partition);

    // Merge the common into each extension.
    let mergeExtension = extension => {
      _.merge(extension, common);
    };
    _.forEach(extensions, mergeExtension);

    // Replace topic references with the referenced sections.
    let dereference = (config) => {
      let derefSection = (value, key, section) => {
        if (key === '_include') {
          // The config can be common or an extension.
          // If the config is an extension, then the
          // extension override is preferred. Otherwise,
          // fall back on the common.
          let ref = config[value] || common[value];
          if (!ref) {
            // Should never happen by the partition
            // construction above.
            throw new Error('The data model configuration reference' +
                            ` was not found: ${ value }`);
          }
          // Add the label to the included section, if necessary.
          if (!ref._label) {
            ref._label = {text: value};
          }
          // Replace the value with the referenced section.
          _.assign(section, ref);
          // Delete the _include marker.
          delete section._include;
        } else if (key !== '_label') {
          // Recurse.
          _.forEach(value, derefSection);
        }
      };

      _.forEach(config, derefSection);
    };
    dereference(common);
    _.forEach(extensions, dereference);

    // The top-level entries are not referenced by another entry.
    // Note that we check the entire input, i.e. both common and
    // extensions, for a child, since a child might be referenced
    // only in an extension.
    let isChild = topic =>
      _.find(this.dataModel, other => topic in other);
    // The entry points into the config hierarchy are the
    // unreferenced topics. The look-up object is thus the
    // values of these entry points.
    let topTopics = _.reject(_.keys(common), isChild);
    let consolidate = config => {
      let top = _.pick(config, topTopics);
      return _.assign({}, ..._.values(top));
    };
    let configs = _.assign({common: common}, extensions);
    let consolidated = _.mapValues(configs, consolidate);

    return consolidated;
  }

  private parseDataModelKey(topic: string): string {
    let match = topic.match(/([\w\s]+)(<(\w+)>)?/);
    if (!match) {
      throw new Error('Invalid data model configuration topic:' +
                      ` ${ topic }`);
    }
    let [ , baseTopic, , qualifier] = match;
    return [baseTopic, qualifier];
  }

  /**
   * Converts the given data model configuration value into a
   * [property, html] pair. The input value must be a property
   * path optionally followed by a html qualifier.
   *
   * @example
   *     'c'                     =>  ['c', undefined]
   *     'c.d.e'                 =>  ['c.d.e', undefined]
   *     'c.vI (v<sub>i</sub>)'  =>  ['c.vI', 'v<sub>i</sub>']
   *     'c.d.e[0]'  =>  ['c.d.e[0]', undefined]
   *
   * @method parseDataModelValue
   * @private
   * @param value {string} the input data model item value
   * @return {string[]} the parsed item [property, html] pair
   */
  private parseDataModelValue(value, key) {
    // The config value might be qualified by a HTML label.
    // The match looks for a property path optionally followed
    // by a html qualifier, as described in the method api doc.
    const pat = /((\w+(\[\d+\])?\.)*(\w+(\[\d+\])?))\s*(\((.+)\))?$/;
    let match = value.match(pat);
    if (!match) {
      throw new Error('Invalid data model configuration entry: ' +
                      `${ key} = ${ value}`);
    }
    // The last property in the property path is the second
    // match group (third match array item), since we ignore
    // the (possibly empty) path prefix first match group.
    // The html is the fourth match group, if such exists.
    let prop = match[1];
    let html = _.last(match);

    return [prop, html];
  }
}
