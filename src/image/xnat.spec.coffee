`import chai, { expect } from "chai"`

`import XNAT from "./xnat.coffee"`

###*
 *  The {{#crossLink "XNAT"}}{{/crossLink}} validator.
 *
 * @class XNATSpec
###
describe 'The XNAT utility', ->
  # The mock image objects.
  mock =
    scan:
      timeSeries:
        name: 'scan_ts.nii.gz'
        resource: 'scan_ts'
        imageSequence:
          _cls: 'Scan'
          number: 1
          session:
            number: 1
            subject:
              number: 1
              collection: 'Breast'
              project: 'QIN_Test'
      volume:
        name: 'volume01.nii.gz'
        resource: 'volume01'
        imageSequence:
          _cls: 'Scan'
          number: 1
          session:
            number: 1
            subject:
              number: 1
              collection: 'Breast'
              project: 'QIN_Test'
    registration:
      volume:
        name: 'volume01.nii.gz'
        resource: 'reg_01'
        imageSequence:
          _cls: 'Registration'
          scan:
            number: 1
          session:
            number: 1
            subject:
              number: 1
              collection: 'Breast'
              project: 'QIN_Test'

  it 'should convert a scan time series image name to an XNAT location', ->
    expected = '/data/QIN_Test/arc001/Breast001_Session01/SCANS/1/scan_ts/scan_ts.nii.gz'
    actual = XNAT.location(mock.scan.timeSeries)
    expect(actual, "The XNAT location is incorrect")
      .to.equal(expected)

  it 'should convert a scan volume image name to an XNAT location', ->
    expected = '/data/QIN_Test/arc001/Breast001_Session01/SCANS/1/volume01/volume01.nii.gz'
    actual = XNAT.location(mock.scan.volume)
    expect(actual, "The XNAT location is incorrect")
      .to.equal(expected)

  it 'should convert a registration volume image name to an XNAT location', ->
    expected = '/data/QIN_Test/arc001/Breast001_Session01/SCANS/1/reg_01/volume01.nii.gz'
    actual = XNAT.location(mock.registration.volume)
    expect(actual, "The XNAT location is incorrect")
      .to.equal(expected)
