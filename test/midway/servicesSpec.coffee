# describe 'Midway Testing Services', () ->
#   tester = null
#   beforeEach () ->
#     tester = ngMidwayTester('qiprofile')
# 
#   afterEach () ->
#     tester.destroy()
#   
#   describe 'The Image Service', () ->
#       
#     it 'should load the image file', (done) ->
#       this.timeout(10000)
#       Image = tester.inject('Image')
#       expect(Image).to.exist
#       mock_scan = {id: 1, files: ['test/fixtures/image.txt']}
#       images = Image.images_for(mock_scan)
#       expect(images.length).to.equal(1)
#       image = images[0]
#       loaded = () ->
#         not not image.data
#       image.load()
#       tester.until loaded, () ->
#         expect(image.data).to.equal('Test image content')
#       done()
