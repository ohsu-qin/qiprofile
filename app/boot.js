var readyForMainLoad;

if (location.origin.match(/localhost/)) {
  System.trace = true;
  readyForMainLoad = System.import('systemjs-hot-reloader').then(function(HotReloader){
    new HotReloader.default('http://localhost:3000')
  });
}

// Import the metadata reflection polyfill library,
// then the zone.js asynchronous dynamic extents library,
// then boot into the app.
//
// Note: zone.js resolves to the zone.js library, not a js file.
Promise.resolve(readyForMainLoad).then(() => {
  System.import('reflect-metadata')
    .then(function() { System.import('zone.js') })
    .then(function() { System.import('src') })
});
