(function() {
  module.exports = function() {
    var chai, chaiAsPromised;
    chai = require('chai');
    chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    return chai.expect;
  };

}).call(this);
