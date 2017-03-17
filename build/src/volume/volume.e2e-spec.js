(function() {
  var Page, VolumeDetailPage, _, expect,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  expect = require('../testing/expect')();

  Page = require('../testing/page');


  /**
    * The Volume Detail E2E page encapsulation.
    *
    * @module volume
    * @class VolumeDetailPage
    * @extends Page
   */

  VolumeDetailPage = (function(superClass) {
    extend(VolumeDetailPage, superClass);

    function VolumeDetailPage() {
      VolumeDetailPage.__super__.constructor.call(this, '/qiprofile/QIN_Test/Breast/subject/1/session/1/scan/1/volumes;volume=1');
    }

    VolumeDetailPage.prototype.imagePanel = function() {
      return this.find('qi-image');
    };

    VolumeDetailPage.prototype.timePointChooser = function() {
      return this.find('.qi-volume-chooser-left');
    };

    VolumeDetailPage.prototype.sessionChooser = function() {
      return this.find('.qi-volume-chooser-right');
    };

    return VolumeDetailPage;

  })(Page);

  describe('E2E Testing Volume Display', function() {
    var page;
    page = null;
    before(function() {
      return page = new VolumeDetailPage;
    });
    it('should load the page', function() {
      return expect(page.content, 'The page was not loaded').to.eventually.exist;
    });
    describe('Header', function() {
      it('should display the title', function() {
        return expect(page.title, 'The title is incorrect').to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 1');
      });
      it('should have a home button', function() {
        return expect(page.home, 'The home URL is incorrect').to.eventually.match(Page.HOME_URL_PAT);
      });
      return describe('Help', function() {
        var help;
        help = null;
        before(function() {
          return help = page.help;
        });
        it('should have help text', function() {
          return expect(help, 'The help text is missing').to.eventually.exist.and.not.be.empty;
        });
        return it('should display a {qu,sugg}estion box hyperlink', function() {
          return expect(help, 'The {qu,sugg}estion box hyperlink is missing').to.eventually.include(Page.SUGGESTION_BOX_URL);
        });
      });
    });
    describe('Image Display', function() {
      var panel;
      panel = null;
      beforeEach(function() {
        return panel = page.imagePanel();
      });
      return it('should display the image', function() {
        return expect(panel, 'The image panel is missing').to.eventually.exist;
      });
    });
    describe('Time Point Chooser', function() {
      var chooser;
      chooser = null;
      beforeEach(function() {
        return chooser = page.timePointChooser();
      });
      xit('should display the volume chooser', function() {
        return expect(chooser, 'The chooser is missing').to.eventually.exist;
      });
      it('should display the volume chooser heading', function() {
        var heading;
        heading = chooser.then(function(resolved) {
          return resolved.findAll('.row');
        }).then(function(rows) {
          return rows[0].text();
        });
        expect(heading, 'The chooser heading is missing').to.eventually.exist;
        return expect(heading, 'The chooser heading is incorrect').to.eventually.equal('Time Point');
      });
      it('should display the volume chooser slider', function() {
        var slider;
        slider = chooser.then(function(resolved) {
          return resolved.find('.qi-vertical-slider');
        });
        return expect(slider, 'The chooser slider is missing').to.eventually.exist;
      });
      return it('should display the volume chooser player', function() {
        return chooser.then(function(resolved) {
          return resolved.find('qi-player');
        }).then(function(player) {
          expect(player, 'The player is missing').to.exist;
          return player.findAll('button').then(function(buttons) {
            var next, play, previous;
            expect(buttons, 'The player buttons are missing').to.not.be.empty;
            expect(buttons.length, 'The player buttons count is incorrect').to.equal(3);
            previous = buttons[0], play = buttons[1], next = buttons[2];
            return next.click().then(function() {
              expect(page.title, 'The next button did not change the title').to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 2');
              return previous.click().then(function() {
                return expect(page.title, 'The previous button did not change the title').to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 1');
              });
            });
          });
        });
      });
    });
    return describe('Session Chooser', function() {
      var chooser;
      chooser = null;
      beforeEach(function() {
        return chooser = page.sessionChooser();
      });
      xit('should display the volume chooser', function() {
        return expect(chooser, 'The chooser is missing').to.eventually.exist;
      });
      it('should display the volume chooser heading', function() {
        var heading;
        heading = chooser.then(function(resolved) {
          return resolved.findAll('.row');
        }).then(function(rows) {
          return rows[0].text();
        });
        expect(heading, 'The chooser heading is missing').to.eventually.exist;
        return expect(heading, 'The chooser heading is incorrect').to.eventually.equal('Session');
      });
      it('should display the volume chooser slider', function() {
        var slider;
        slider = chooser.then(function(resolved) {
          return resolved.find('.qi-vertical-slider');
        });
        return expect(slider, 'The chooser slider is missing').to.eventually.exist;
      });
      return it('should display the volume chooser player', function() {
        return chooser.then(function(resolved) {
          return resolved.find('qi-player');
        }).then(function(player) {
          expect(player, 'The player is missing').to.exist;
          return player.findAll('button').then(function(buttons) {
            var next, play, previous;
            expect(buttons, 'The player buttons are missing').to.not.be.empty;
            expect(buttons.length, 'The player buttons count is incorrect').to.equal(3);
            previous = buttons[0], play = buttons[1], next = buttons[2];
            return next.click().then(function() {
              expect(page.title, 'The next button did not change the title').to.eventually.equal('Breast Patient 1 Session 2 Scan 1 Volume 1');
              return previous.click().then(function() {
                return expect(page.title, 'The previous button did not change the title').to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 1');
              });
            });
          });
        });
      });
    });
  });

}).call(this);
