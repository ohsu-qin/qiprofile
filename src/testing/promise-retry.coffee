_ = require('lodash')
sleep = require('sleep-promise')

promiseRetry = (fn, msec=2000) ->
  fn().then (result) ->
    if _.isNil(result) and msec
      msec -= Math.min(msec, 200)
      sleep(msec).then ->
        promiseRetry(fn, msec)
    else
      result

module.exports = promiseRetry
