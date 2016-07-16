// Boot the app as follows:
// * Start the hot reloader. This is a no-op in a production build.
// * Import the metadata reflection polyfill library.
// * Import the zone.js asynchronous dynamic extents library.
// * Boot into the app.
//
// Note: zone.js resolves to the zone.js library, not a js file.
System.trace = true;
System.import('systemjs-hot-reloader')
  .then(function(HotReloader) { new HotReloader.default('http://localhost:3000') })
  .then(function() { System.import('reflect-metadata') })
  .then(function() { System.import('zone.js') })
  .then(function() { System.import('src') });
