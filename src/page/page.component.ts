import * as _ from 'lodash';
import { TemplateRef } from '@angular/core';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * The abstract page component base class. A *page component* is
 * a component with a distinct url location and HTML page.
 *
 * @class PageComponent
 * @module page
 * @abstract
 */
export abstract class PageComponent {
  /**
   * The error message to display.
   *
   * @property error {string}
   */
  error: string;

  /**
   * The accordion panel open state.
   *
   * @property panelOpen {Object}
   */
  private panelOpen = {};

  constructor(private modalService: NgbModal) { }

  /**
   * Returns whether the given accordion panel is open.
   * Accordion panels are assumed to be opened by the page initially.
   *
   * @method isPanelOpen
   * @param panelId {string} the panel id
   * @return {boolean} `true` if the panel is open, `false` otherwise
   */
  isPanelOpen(panelId: string): boolean {
    return _.get(this.panelOpen, panelId, true);
  }

  onPanelChange(ev: NgbPanelChangeEvent) {
    _.set(this.panelOpen, ev.panelId, ev.nextState);
  }

  /**
   * Delegates to
   * {{#crossLink "PageComponent/openHelp"}}{{/crossLink}}
   * with the CSS class `.qi-page-help`.
   *
   * @method openPageHelp
   * @param content {TemplateRef} the help content
   */
  openPageHelp(content: TemplateRef) {
    this.openHelp(content, 'qi-page-help');
  }

  /**
   * Displays the help in a modal dialog.
   *
   * @method openPageHelp
   * @param content {TemplateRef} the required help HTML content
   * @param windowClass {string} the optional help CSS class
   */
  openHelp(content: TemplateRef, windowClass?: string) {
    if (windowClass) {
      this.modalService.open(content, {windowClass: windowClass});
    } else {
      this.modalService.open(content);
    }
  }

  /**
   * Sets the error property which triggers the error pop-pup.
   * The subclass has the responsibility of binding an error event
   * to this handler, e.g.:
   *
   *     qi-some-directive((error)="onError($event)")
   *
   * @method onError
   * @param message {string} the error messaage
   */
  onError(message: string) {
    this.error = message;
  }

  /**
   * Unsets the error property.
   *
   * @method clearError
   */
  clearError() {
    this.error = null;
  }
}
