This lib directory contains the following unpackaged vendor utility
libraries:

* Papaya (https://github.com/rii-mango/Papaya)

* bowser (from Papaya lib/)

* nifti-reader (from Papaya lib/)

`papaya.js` is built as follows:

* Clone the Papaya repository.

* Make the directory `release/current/plain`.

* Execute the following from the Papaya root directory:
  
      cat lib/jquery.js lib/GLU.js lib/numerics.js src/js/constants.js src/js/utilities/* \
        src/js/core/* src/js/volume/nifti/* src/js/volume/*.js src/js/surface/* \
        src/js/ui/* src/js/viewer/* src/js/main.js >release/current/plain/papaya.js
      cp lib/pako-inflate.js release/standard/papaya.css release/current/plain/

* Edit `release/current/plain/papaya.js` as follows:

  - Make the `glMatrixArrayType` and `quat4` variables local by changing
    `glMatrixArrayType=` and `quat4=` to `var glMatrixArrayType` and
    `var quat4=`.
  
  - Fix a Papaya bug by moving the following lines:
  
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    
    from `initializeViewer()` to `resizeViewer()` after the canvas width
    and height are reset.
  
  - Reset the `PAPAYA_PADDING` variable to 0.
  
  - Prepend the following imports:
  
        import bowser from 'bowser.js';
        import gifti from 'gifti-reader-js';
        import nifti from 'nifti-reader-js';
        import pako from './pako-inflate.js';
  
    The `bowser`, `gifti` and `nifti` libraries are loaded by jspm as
    part of the qiprofile install. `pako-inflate` is a version of `pako`
    modified by the Papaya developers. `jquery` is the 1.9.1 version used
    by Papaya, but that version installed with `jspm install jquery@1.9.1`
    cannot be imported without an error. Papapya is not compatible with the
    current jquery 3.x version. 
  
  - Postpend the following export:
    
        export { papaya as default };

* Copy the Papaya `release/current/plain/` contents to this qiprofile `lib/` directory.
