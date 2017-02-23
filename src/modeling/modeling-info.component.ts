import * as _s from 'underscore.string';
import {
  Component, Input, ElementRef, ViewContainerRef
} from '@angular/core';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap/index.js';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'qi-modeling-info',
  templateUrl: '/public/html/modeling/modeling-info.html'
})

/**
 * The modeling info component displays the modeling source and
 * input parameters.
 *
 * @module modeling
 * @class ModelingInfoComponent
 */
export class ModelingInfoComponent {
  /**
   * The subject {{#crossLink "ModelingResults"}}{{/crossLink}}
   * REST object containing the source and protocol to display.
   *
   * @property modeling {Object}
   */
  @Input() modeling;

  /**
   * This component's HTML. This method is intended only for use by the
   * parent component to display this child component's HTML in a modal
   * dialog to work around ``angular2-modal``
   * [Issue 277](https://github.com/shlomiassaf/angular2-modal/issues/277).
   *
   * @property innerHTML {string}
   */
  get innerHTML() {
    // TODO - remove this work-around when the aforementioned issue
    // is fixed.
    let html = this.elementRef.nativeElement.innerHTML;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  constructor(
    vcRef: ViewContainerRef, overlay: Overlay, private modal: Modal,
    private elementRef: ElementRef, private sanitizer: DomSanitizer
  ) {
    // Prep the modal in the obscure idiom favored by angular2-modal.
    overlay.defaultViewContainer = vcRef;
  }

  /**
   * Opens the source protocol modal dialog.
   *
   * @method openProtocolInfo
   */
  openProtocolInfo() {
    let title = `${ _s.capitalize(modeling.source.type) } Protocol`;
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title(title)
      // TODO - dlg to session pcl svc w/ id modeling.source.protocol
      .body('<span>TODO</span>')
      .open();
  }
}
