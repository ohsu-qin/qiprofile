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
   * The time in milliseconds to pause until the next request
   * is made during play. The default is half a second.
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
   * The state machine is as follows:
   * ```
   * next|previous -> clear play; request -> receive ->
   *       clear waiting flag
   *
   * play -> set play; request -> receive -> repeat
   * ```
   * If the {{#crossLink "PlayerComponent/isWaiting:property"}}{{/crossLink}}
   * flag is set, then the request is queued.
   * Otherwise, the request is issued and the waiting flag is set.
   *
   * When the request is fulfilled, if there is a queued request
   * then fire the queued request and retain the waiting state.
   * Otherwise, clear the waiting flag.
   *
   * The repeat is paused, if necessary, until the
   * {{#crossLink "PlayerComponent/delay:property"}}{{/crossLink}}
   * time elapses.
   *
   * @method ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    let cancel = changes['cancel'];
    if (cancel && cancel.currentValue) {
      // Clear everything.
      this.queued = null;
      this.isPlaying = false;
      this.isWaiting = false;
      return;
    }
    let valueChange = changes['value'];
    // If the value request was initiated by this player component,
    // then the waiting flag is set. However, a value request
    // might have been initiated elsewhere, e.g. by a slider,
    // and then reflected back to this player component's input.
    // In that case, the waiting flag is not set and we can
    // ignore the value change.
    if (!valueChange.isFirstChange()) {
      if (!this.isWaiting) {
        // All we need to do is a consistency check. It is an
        // error to not be waiting but have a request queued.
        if (this.queued) {
          throw new Error('The player is not waiting but has a' +
                          ' request queued');
        }
        return;
      }
      // Clear the waiting flag.
      this.isWaiting = false;
      // There is a new value.
      // If play is on, then fire the next request after a
      // respectable time lag.
      // Otherwise, if a request is queued, then fire the queued
      // request and clear the queued variable.
      // Otherwise, since nothing is playing or queued, then clear
      // the waiting flag and move on.
      if (this.isPlaying) {
        // If the player was pending, then clear its queued action.
        this.queued = null;
        // Wait if necessary.
        let next = () => {
          // Reset the timer.
          this.stopWatch = Date.now();
          // Recheck the playing flag, since the user might have
          // cancelled play in the interim.
          if (this.isPlaying) {
            // Request the next value.
            this.dispatch('next');
          }
        };
        // The split time.
        let delta = Date.now() - this.stopWatch;
        // If the delay exceeds the split time, then sit and spin
        // until the delay is up. Otherwise, request the next value
        // on the next cycle.
        let pause = Math.max(this.delay - delta, 0);
        setTimeout(next, pause);
      } else if (this.queued) {
        let queued = this.queued;
        // Clear the queued variable.
        this.queued = null;
        // Fire the queued action.
        this.dispatch(queued);
      }
    }
  }

  /**
   * Toggles the player as a result of a user click on the
   * play button.
   *
   * @method togglePlay
   */
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // If the player was off but is now started, then request
    // the next value. Otherwise, clear any queued request.
    // A queued request during play can only arise from the
    // active play. A previous or next click clears the playing
    // flag on its own without calling this method.
    if (this.isPlaying) {
      this.dispatch('next');
    } else {
      // Clear the queued request, if it exists, but not the
      // waiting flag. The waiting flag is only cleared by the
      // change handler.
      this.queued = null;
    }
  }

  /**
   * If the player is already waiting on a value change, then
   * queue up the given action. Otherwise, fire the action
   * immediately.
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
    // Stop the player, if necessary.
    this.isPlaying = false;
    // Fetch the previous value.
    this.dispatch('previous');
  }

  /**
   * Obtains the next value.
   *
   * @method onNext
   */
  onNext() {
    // Stop the player, if necessary.
    this.isPlaying = false;
    // Fetch the next value.
    this.dispatch('next');
  }
}
