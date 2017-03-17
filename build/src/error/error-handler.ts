/**
 * The error handler module.
 *
 * @module error
 * @main error
 */

/**
 * The custom global error handler.
 *
 * @class ErrorHandler
 */
export class ErrorHandler {
  /**
   * Logs the error stack trace and displays the error message.
   *
   * @method handleError
   * @param error {Error} the uncaught error
   */
  handleError(error) {
    console.log(error);
    // TODO - display the pop-up.
  }
}
