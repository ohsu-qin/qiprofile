System.trace = true;
System.import('systemjs-hot-reloader').then(function(HotReloader){
   new HotReloader.default('http://localhost:3000/qiprofile')
});
System.import('src')
  .then(function() {
    console.log('Running.');
  })
  .catch(function(err) {
    console.log(err);
    console.log(err.originalErr);
  });

// Boot into the src main component.
System.import('src')
  .then(function() {
    console.log('Running.');
  })
  .catch(function(err) {
    console.log(err);
    console.log(err.originalErr);
  });
