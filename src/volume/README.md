Note
----
`nouislider.ts` is copied from the `ohsu-qin/ng2-nouislider`
fork of `ng2-nouislider`.

The `ng2-nouislider` is forked to fix the following bug:

* ng2-nouislider does not detect changes to the ngModel input.

The fork `nouislider.ts` is then copied to this `qiprofile` source
code directory because the jspm install of the fork GitHub project
results in the following import error:
```
    Error loading http://localhost:3000/angular2/core as "angular2/core" from
    http://localhost:3000/jspm_packages/github/ohsu-qin/ng2-nouislider@0.3.0/nouislider.js
```
This error occurs even though there is no reference to "angular2/core"
in the library, only "@angular/core".

Although it would be preferable to place `nouislider.ts` in the
`lib/` directory, that in turn results in the infamous `Unexpected token`
jspm error. This opaque error has several obscure causes, but none
seem to apply to this case. For an unknown reason, copying the file
into the directory where it is imported works. Perhaps `jspm.config.js`
is missing a magic incantation for the 'lib' directory.

TODO - revisit this when jspm and Angular 2 stabilize in 2017.
