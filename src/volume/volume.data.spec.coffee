`import * as _ from "lodash"`

`import Volume from "./volume.data.coffee"`

###*
 * The {{#crossLink "Volume"}}{{/crossLink}} validator.
 *
 * @module volume
 * @class VolumeSpec
###
describe 'The Volume data utility', ->
  # The mock object.
  mock =
    scan:
      _cls: 'Scan'
      title: 'Breast Patient 1 Session 1 Scan 1'
      path: [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1},
             {session: 1}, {scan: 1}]
      volumes:
        name: 'NIFTI'
        images:  [
          name: 'volume001.nii.gz'
          averageIntensity: 3.1
        ]
  volume = null
  scan = null

  beforeEach ->
    scan = _.cloneDeep(mock.scan)
    volume = scan.volumes.images[0]
    # Extend the test volume.
    Volume.extend(volume, scan, 1)

  describe 'Path', ->
    it 'should have a path', ->
      expected = [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1},
                  {session: 1}, {scan: 1}, {volume: 1}]
      expect(volume.path, "The volume is missing a path").to.exist
      expect(
        volume.path,
        "The volume path is incorrect: #{ JSON.stringify(volume.path) }"
      ).to.eql(expected)

  describe 'find', ->
    it 'should find the scan volume', ->
      target = Volume.find(scan, 1)
      expect(target, "The target was not found").to.exist
      expect(target, "The target is incorrect").to.equal(volume)

  describe 'extend', ->
    it 'should reference the parent scan', ->
      expect(volume.scan, "The volume is missing the scan reference")
        .to.exist
      expect(volume.scan, "The volume scan reference is incorrect")
        .to.equal(scan)

    it 'should set the volume number', ->
      expect(volume.number, "The volume number is missing").to.exist
      expect(volume.number, "The volume number is incorrect").to.equal(1)

    it 'should have a virtual title property', ->
      expect(volume.title, "The volume title is missing").to.exist
      expect(volume.title, "The volume title is incorrect")
        .to.equal('Breast Patient 1 Session 1 Scan 1 Volume 1')

    it 'should alias the imageSequence reference to the scan', ->
      expect(volume.imageSequence, "The volume is missing the" +
                                   " imageSequence alias")
        .to.exist
      expect(volume.imageSequence, "The volume imageSequence alias" +
                                   " is incorrect")
         .to.equal(scan)

    it 'should have a resource property', ->
      expect(volume.resource, "The resource is missing").to.exist
      expect(volume.resource, "The resource is incorrect")
        .to.equal(scan.volumes.name)

      it 'should have a load function', ->
        expect(volume.load, "The load function is missing")
          .to.exist
