mocha.setup({timeout: 5000})

# TODO - chai-as-promised.js is not a well-defined module. It is
# a chunk of Javascript with no global name and no AMD definition.
# Therefore, it can't be concatenated into javascripts/test.js.
# The alternatives below don't work. requirejs would load it, but
# that is overkill for this limited test hack. Use browsify for
# this? For now, forget eventually. However, the alternative
# async Javascript test hack ngMidwayTester 'until' either times
# out or ignores the until block and claims the test passes.
#
# Load the eventually chain.
# require 'chai-as-promised' => require not defined
#$.getScript 'node_modules/chai-as-promised/lib/chai-as-promised.js', (data) ->
#  mocha.use(data) => 404
