sharedConfig = require './protractor_shared_conf'

cfg = sharedConfig()
cfg.files = ['../e2e/**/*Spec.coffee']

exports.config = cfg
