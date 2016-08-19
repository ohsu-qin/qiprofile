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
      number: 1
      title: 'Breast Patient 1 Session 1 Scan 1'
      session:
        number: 1
        subject:
          number: 1
          collection: 'Breast'
          project: 'QIN_Test'
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

  describe 'find', ->
    it 'should find the scan volume', ->
      target = Volume.find(scan, 1)
      expect(target, "The target was not found").to.exist
      expect(target, "The target is incorrect").to.equal(volume)

  describe.only 'extend', ->
    it 'should reference the parent scan', ->
      expect(volume.scan, "The volume is missing the scan reference")
        .to.exist
      expect(volume.scan, "The volume scan reference is incorrect")
        .to.equal(scan)

    it 'should set the volume number', ->
      expect(volume.number, "The volume number is missing").to.exist
      expect(volume.number, "The volume number is incorrect").to.equal(1)

    it 'should have a title property', ->
      expect(volume.title, "The volume title is missing").to.exist
      expect(volume.title, "The volume title is incorrect")
        .to.equal('Breast Patient 1 Session 1 Scan 1 Volume 1')

    it 'should have an identifier property', ->
      expected = '/QIN_Test/Breast/1/1/1/NIFTI/volume001.nii.gz'
      expect(volume.identifier, "The volume is missing an identifier").to.exist
      expect(
        volume.identifier,
        "The volume identifier is incorrect: #{ volume.identifier }"
      ).to.equal(expected)

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
