var readyForMainLoad;

if (location.origin.match(/localhost/)) {
  System.trace = true;
  readyForMainLoad = System.import('systemjs-hot-reloader').then(function(HotReloader){
    new HotReloader.default('http://localhost:3000')
  });
}
Promise.resolve(readyForMainLoad).then(() => {
  System.import('reflect-metadata')
    .then(function() { System.import('zone.js') })
    .then(function() { System.import('src') })
});
