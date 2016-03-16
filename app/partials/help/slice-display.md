This page displays the 2D MR image slice and PK modeling color maps.

The buttons above the image at left let you display a map of PK modeling
results over the 3D volume. Color maps are turned off when the image is
initially loaded. The following overlay options may be included:

* &Delta;K<sub>trans</sub>: the measure of the shutter speed effect on
  K<sub>trans</sub> estimation (i.e., FXL K<sub>trans</sub> subtracted
  from FXR K<sub>trans</sub>)

* FXL K<sub>trans</sub>: the vascular permeability transfer constant for
  the standard model

* FXR K<sub>trans</sub>: the vascular permeability transfer constant for
  the shutter speed model

* &tau;<sub>i</sub>: the FXR intracellular H<sub>2</sub>O mean lifetime

* v<sub>e</sub>: the FXR extravascular extracellular volume fraction

Click on the <span class="glyphicon glyphicon-info-sign"></span> button
to the left of the overlay buttons to view details about modeling input
and registration (motion correction).

On the right, the image control panel lets you adjust the appearance of
the image and overlay. The following controls are available:

* Opacity: Drag the slider to adjust the transparency of the volume.

* Cross Section: Drag these sliders to control the cross sectional
  slicing of the image along the sagittal, coronal, and axial planes.

* Threshold: Drag these sliders to adjust the lower and upper bounds of
  the threshold range. This operation converts each voxel in the image
  into black, white, or unchanged depending on whether the original
  color value is within the range.
