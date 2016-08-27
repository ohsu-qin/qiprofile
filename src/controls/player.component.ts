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
   * The button enabled state.
   *
   * @property isEnabled {boolean}
   */
  @Input() isEnabled;

  /**
   * Forces the play state off.
   *
   * @property stopPlay {boolean}
   */
  @Input() stopPlay;

  /**
   * This play event emits `true` to start looping over the values,
   * `false` to stop.
   *
   * @property play {EventEmitter<boolean>}
   */
  @Output() play: EventEmitter<boolean> = new EventEmitter(true);

  /**
   * This previous event is triggered when the user presses the back
   * button.
   *
   * @property previous {EventEmitter<boolean>}
   */
  @Output() previous: EventEmitter<boolean> = new EventEmitter(true);

  /**
   * This next event is triggered when the user presses the forward
   * button.
   *
   * @property next {EventEmitter<boolean>}
   */
  @Output() next: EventEmitter<boolean> = new EventEmitter(true);

  /**
   * Flag indicating whether to loop over the values.
   *
   * @property isPlaying {boolean}
   */
  isPlaying = false;

  /**
   * Handles a change to the
   * {{#crossLink "PlayerComponent/stopPlay:property"}}{{/crossLink}}.
   * input.
   *
   * @method ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    let stopChange = changes['stopPlay'];
    if (stopChange && !stopChange.isFirstChange()) {
      if (stopChange.currentValue) {
        this.isPlaying = false;
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
    this.play.emit(this.isPlaying);
  }

  /**
   * Goes back one value.
   *
   * @method previous
   */
  previousTick() {
    this.previous.emit();
  }

  /**
   * Advances the value.
   *
   * @method next
   */
  nextTick() {
    this.next.emit();
  }
}
