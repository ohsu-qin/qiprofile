describe 'Unit Testing Services', () ->

  beforeEach () ->
    angular.mock.module('qiprofile.services')

  describe 'The Image Service', () ->
    Image = null

    beforeEach () ->
      inject ['Image', (_Image_) ->
        Image = _Image_
      ]
    
    it 'should load the image file', () ->
      this.timeout(10000)
      expect(Image).to.exist
      mock_scan = {id: 1, files: ['test/fixtures/image.txt']}
      images = Image.images_for(mock_scan)
      expect(images.length).to.equal(1)
      image = images[0]
      image.load()
      expect(image.data).to.exist
