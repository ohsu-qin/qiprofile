(function() {
  import * as _ from "lodash";
  import Volume from "./volume.data.coffee";

  /**
   * The {{#crossLink "Volume"}}{{/crossLink}} validator.
   *
   * @module volume
   * @class VolumeSpec
   */
  describe('The Volume data utility', function() {
    var mock, scan, volume;
    mock = {
      scan: {
        _cls: 'Scan',
        number: 1,
        title: 'Breast Patient 1 Session 1 Scan 1',
        session: {
          number: 1,
          subject: {
            number: 1,
            collection: 'Breast',
            project: 'QIN_Test'
          }
        },
        volumes: {
          name: 'NIFTI',
          images: [
            {
              name: 'volume001.nii.gz',
              averageIntensity: 3.1
            }
          ]
        }
      }
    };
    volume = null;
    scan = null;
    beforeEach(function() {
      scan = _.cloneDeep(mock.scan);
      volume = scan.volumes.images[0];
      return Volume.extend(volume, scan, 1);
    });
    describe('find', function() {
      return it('should find the scan volume', function() {
        var target;
        target = Volume.find(scan, 1);
        expect(target, "The target was not found").to.exist;
        return expect(target, "The target is incorrect").to.equal(volume);
      });
    });
    return describe.only('extend', function() {
      it('should reference the parent scan', function() {
        expect(volume.scan, "The volume is missing the scan reference").to.exist;
        return expect(volume.scan, "The volume scan reference is incorrect").to.equal(scan);
      });
      it('should set the volume number', function() {
        expect(volume.number, "The volume number is missing").to.exist;
        return expect(volume.number, "The volume number is incorrect").to.equal(1);
      });
      it('should have a title property', function() {
        expect(volume.title, "The volume title is missing").to.exist;
        return expect(volume.title, "The volume title is incorrect").to.equal('Breast Patient 1 Session 1 Scan 1 Volume 1');
      });
      it('should have an identifier property', function() {
        var expected;
        expected = '/QIN_Test/Breast/1/1/1/NIFTI/volume001.nii.gz';
        expect(volume.identifier, "The volume is missing an identifier").to.exist;
        return expect(volume.identifier, "The volume identifier is incorrect: " + volume.identifier).to.equal(expected);
      });
      it('should alias the imageSequence reference to the scan', function() {
        expect(volume.imageSequence, "The volume is missing the" + " imageSequence alias").to.exist;
        return expect(volume.imageSequence, "The volume imageSequence alias" + " is incorrect").to.equal(scan);
      });
      return it('should have a resource property', function() {
        expect(volume.resource, "The resource is missing").to.exist;
        expect(volume.resource, "The resource is incorrect").to.equal(scan.volumes.name);
        return it('should have a load function', function() {
          return expect(volume.load, "The load function is missing").to.exist;
        });
      });
    });
  });

}).call(this);
