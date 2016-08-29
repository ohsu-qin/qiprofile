import {
  Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter
} from '@angular/core';

@Component({
  selector: 'qi-player',
  templateUrl: '/public/html/controls/player.html'
})

/**
 * The player component.
 *
 * @module controls
 * @class PlayerComponent
 */
export class PlayerComponent implements OnInit, OnChanges {
  /**
   * The current value.
   *
   * @property value {any}
   */
  @Input() value;

  /**
   * The time in milliseconds to pause until the
   * next request is made during play. The default
   * is half a second.
   *
   * @property delay {number}
   */
  @Input() delay = 500;

  /**
   * Cancels any pending action if set.
   *
   * @property cancel {boolean}
   */
  @Input() cancel;

  /**
   * Signals that the parent component should obtain either the
   * `previous` or `next` value.
   *
   * @property next {EventEmitter<boolean>}
   */
  @Output() action: EventEmitter<boolean> = new EventEmitter();

  /**
   * Flag indicating whether to loop over the values.
   *
   * @property isPlaying {boolean}
   */
  isPlaying = false;

  /**
   * Flag indicating whether a value request is pending.
   *
   * @property isWaiting {boolean}
   */
  private isWaiting = false;

  /**
   * The time of the last player iteration, or zero to start.
   *
   * @property stopWatch {number}
   * @private
   */
  private stopWatch = 0;

  /**
   * The queued `previous` or `next` action to be emitted when
   * the next value is available.
   *
   * @property queued {string}
   * @private
   */
  private queued: string;

  /**
   * Handles a value change or
   * {{#crossLink "PlayerComponent/cancel:property"}}{{/crossLink}}
   * request.
   *
   * @method ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    let cancel = changes['cancel'];
    if (cancel && cancel.currentValue) {
      this.queued = null;
      this.isPlaying = false;
      this.isWaiting = false;
    } else if (changes['value']) {
      if (this.queued) {
        if (this.isPlaying) {
          // Wait if necessary.
          let next = () => {
            this.stopWatch = Date.now();
            this.action.emit(this.queued);
          };
          let delta = Date.now() - this.stopWatch;
          let pause = Math.max(this.delay - delta, 0);
          setTimeout(next, pause);
        } else {
          // Fire the queued action.
          this.action.emit(this.queued);
          // Clear the queued action.
          this.queued = null;
        }
      } else {
        // The value is available and nothing is on tap.
        this.isWaiting = false;
      }
    }
  }

  /**
   * Toggles the player.
   *
   * @method togglePlay
   */
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // If the player was off but is now started, then
    // request the next value. Otherwise, clear any
    // queued request.
    if (this.isPlaying) {
      this.dispatch('next');
    } else {
      this.queued = null;
    }
  }

  /**
   * If the player is already waiting on a value change,
   * then queue up the given action. Otherwise, fire the
   * action immediately.
   *
   * @method dispatch
   * @param action {string} the action to dispatch
   */
  dispatch(action: string) {
    if (this.isWaiting) {
      this.queued = action;
    } else {
      this.action.emit(action);
      this.isWaiting = true;
    }
  }

  /**
   * Obtains the previous value.
   *
   * @method onPrevious
   */
  onPrevious() {
    this.dispatch('previous');
  }

  /**
   * Obtains the next value.
   *
   * @method onNext
   */
  onNext() {
    this.dispatch('next');
  }
}
