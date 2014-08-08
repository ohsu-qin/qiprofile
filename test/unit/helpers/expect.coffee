# Augment the Chai expect function with the eventually assertion.
# define ['chai', 'chaiAsPromised'], (chai, chaiAsPromised) ->
#   chai.use(chaiAsPromised)
define ['chai', 'chaiAsPromised'], (chai, chaiAsPromised) ->
  chai.use(chaiAsPromised)
  chai.expect
