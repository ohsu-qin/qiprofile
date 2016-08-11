This lib directory contains the following unpackaged vendor utility
libraries:

* Papaya (https://github.com/rii-mango/Papaya)

* bowser (from Papaya lib/)

* nifti-reader (from Papaya lib/)

`papaya.js` is built as follows:

* Clone the Papaya repository.

* Make the directory `release/current/plain`.

* Execute the following from the Papaya root directory:
    ```
      mkdir -p release/current/plain
      cat lib/jquery.js lib/GLU.js lib/numerics.js src/js/constants.js src/js/utilities/* \
        src/js/core/* src/js/volume/nifti/* src/js/volume/*.js src/js/surface/* \
        src/js/ui/* src/js/viewer/* src/js/main.js >release/current/plain/papaya.js
      cp lib/pako-inflate.js release/current/standard/papaya.css release/current/plain/
    ```
* Edit `release/current/plain/papaya.js` as follows:
  
  - Fix a Papaya bug described in the start comment below by moving the
    following lines:
    ```
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    ```
    from `initializeViewer()` to `resizeViewer()` after the canvas width
    and height are reset.
  
  - Prepend the following:
    ```
        import bowser from 'bowser';
        import gifti from 'gifti-reader-js';
        import nifti from 'nifti-reader-js';
        import pako from './pako-inflate.js';
        
        var glMatrixArrayType;
        var quat4;
    ```
    The `bowser`, `gifti` and `nifti` libraries are loaded by jspm as
    part of the qiprofile install. `pako-inflate` is a version of `pako`
    modified by the Papaya developers. `jquery` is the 1.9.1 version used
    by Papaya, but that version installed with `jspm install jquery@1.9.1`
    cannot be imported without an error. Papapya is not compatible with the
    current jquery 3.x version. 
    
    The variable declarations compensate for two lax GLU library declarations
    that will otherwise result in a jspm load error.
  
  - Postpend the following export:
    ```
        export { papaya as default };
    ```
* Copy the Papaya `release/current/plain/` contents to the qiprofile `lib/`
  directory.

* Papaya is started as follows:
    ```
      // Start the renderer.
      papaya.Container.startPapaya();
      // Resize the viewer to work around the following Papaya bug:
      // * Papaya initial display fills in the canvas with the body element
      //   background color, but then resizes the canvas to a smaller dimension,
      //   which automatically refills it to black. That wipes out the padding
      //   between the slice views. This bug is fixed by moving the fillRect
      //   from initializeViewer() to resizeViewer() after the canvas width
      //   and height are reset.
      //
      //   However, that fix reveals another bug. When Papaya sets the Swap
      //   button css, a black strip on the right is mysteriously created.
      //   Filling that strip has no effect for some reason. The work-around is
      //   to resize the viewer after the initial display, as shown below. That
      //   causes a slight flicker, but we can live with that.
      papaya.Container.resizePapaya(null, true);
    ```
