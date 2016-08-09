`import * as _ from "lodash"`
`import moment from "moment"`

`import Session from "./session.data.coffee"`

###*
 * The {{#crossLink "Session"}}{{/crossLink}} validator.
 *
 * Note: image load cannot be unit-tested, since it requires an
 *   active browser.
 *
 * @module session
 * @class SessionSpec
###
describe 'The Session data utility', ->
# The mock objects.
  mock =
    subject:
      title: 'Breast Patient 1'
      path: [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1}]

    session:
      acquisitionDate: moment('Jul 1, 2013', 'MMM DD, YYYY').valueOf()
      modelings: [
        resource: 'pk_01'
        protocol: 'mp1'
        source:
          registration: 'rp1'
        result:
          deltaKTrans:
            name: "delta_k_trans.nii.gz"
            average: 2.3
            labelMap:
              name: "delta_k_trans_color.nii.gz"
              colorTable: "/etc/color_table.txt"
      ]

    detail:
      scans: [
        _cls: 'Scan'
        number: 1
        protocol: 'sp1'
        time_series:
          name: 'scan_ts'
          image:
            name: 'scan_ts.nii.gz'
        volumes:
          name: 'NIFTI'
          images: [
            name: 'volume001.nii.gz'
          ]
      ]

  subject = mock.subject
  session = null

  beforeEach ->
    session = _.cloneDeep(mock.session)
    # Extend the mock session.
    Session.extend(session, subject, 1)

  describe 'Path', ->
    it 'should have a path', ->
      expected = [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1},
                  {session: 1}]
      expect(session.path, "The session is missing a path").to.exist
      expect(
        session.path,
        "The session path is incorrect: #{ JSON.stringify(session.path) }"
      ).to.eql(expected)

  describe 'extend', ->
    it 'should reference the parent subject', ->
      expect(session.subject, "The session does not reference the" +
                              " parent subject")
        .to.exist
      expect(session.subject, "The session subject reference is" +
                              " incorrect")
        .to.equal(subject)

    it 'should set the session number', ->
      expect(session.number, "The session is missing a number").to.exist
      expect(session.number, "The session number is incorrect").to.equal(1)

    describe 'Overlays', ->
      overlays = null

      beforeEach ->
        overlays = session.overlays

      it 'should have one modeling overlay', ->
        expect(overlays, "Modeling is missing overlays").to.exist
        expect(overlays.length, "Modeling overlays count is" +
                                " incorrect")
          .to.equal(1)

      it 'should recapitulate the modeling result delta Ktrans overlay', ->
        expect(overlays[0], "Modeling result overlays is incorrect")
          .to.equal(session.modelings[0].result.deltaKTrans.labelMap)

    describe 'Modeling', ->
      modelingResult = null
      
      beforeEach ->
        modelingResult = session.modelings[0].result
      
      describe 'Parameter', ->
        paramResult = null

        beforeEach ->
          if modelingResult
            paramResult = modelingResult.deltaKTrans

        it 'should reference the modeling result object', ->
          expect(paramResult.modelingResult,
                 "Modeling parameter result does not reference" +
                 " the parent modeling result object").to.exist
          expect(paramResult.modelingResult,
                 "Modeling parameter result parent reference" +
                 " is incorrect").to.equal(modelingResult)

        describe 'Overlay', ->
          overlay = null

          beforeEach ->
            if paramResult
              overlay = paramResult.overlay

          it 'should have a modeling parameter result overlay', ->
            expect(overlay,
                   "The modeling parameter result does not reference" +
                   " an overlay").to.exist
            expect(overlay, "The modeling parameter result overlay" +
                            " is not the label map")
              .to.equal(paramResult.labelMap)

          it 'should reference the parent modeling parameter result', ->
            expect(overlay.parameterResult,
                   "The overlay does not reference the parent" +
                   " modeling parameter result")
              .to.exist
            expect(overlay.parameterResult,
                   "The overlay parameter result reference is incorrect")
              .to.equal(paramResult)

    describe 'detail', ->
      extended = null
      
      beforeEach ->
        # Fetch the detail.
        extended = session.extendDetail(mock.detail)

      it 'should return a result', ->
        expect(extended, "Session extendDetail did not return a value").to.exist

      it 'should return the augmented session object', ->
        expect(extended, "Session extendDetail did not return the session")
          .to.equal(session)

      it 'should have scans', ->
        expect(session.scans, "Session is missing the scans")
          .to.exist.and.not.be.empty

      it 'should have empty registrations', ->
        expect(session.scans[0].registrations,
               "Session extendDetail did not create the empty registrations")
          .to.exist.and.be.empty
