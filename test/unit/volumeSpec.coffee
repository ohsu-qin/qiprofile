# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'volume', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    mock =
      scan:
        _cls: 'Scan'
        title: 'Breast Subject 1 Session 1 Scan 1'
        volumes:
          name: 'NIFTI'
          images:  [
            name: 'volume001.nii.gz'
            averageIntensity: 3.1
          ]

    describe 'Unit Testing the Volume Service', ->
      Volume = null
      volume = null
      scan = null

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.volume')
        inject ['Volume', (_Volume_) ->
          Volume = _Volume_
        ]
        scan = _.cloneDeep(mock.scan)
        volume = scan.volumes.images[0]
        # Extend the test volume.
        Volume.extend(volume, scan, 1)

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
            .to.equal('Breast Subject 1 Session 1 Scan 1 Volume 1')

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
          
          # TODO - test image load.
