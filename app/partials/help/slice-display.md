This page displays the 2D MR image slice and pharmokinetic modeling
color maps.

Image selection
---------------
Click on the *Orientation* left
<span class="glyphicon glyphicon-step-backward"></span>
or right <span class="glyphicon glyphicon-step-forward"></span> button
to scroll through the MR slices in the orientation dimension.

Click on the *Time Point* left
<span class="glyphicon glyphicon-step-backward"></span>
or right <span class="glyphicon glyphicon-step-forward"></span> button
to scroll through the MR volumes in the time dimension.

Modeling Result
---------------
Click on a Modeling Result button above the MR image to overlay the
result on the image. The possible overlays include the following:

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

Image Control
-------------
The control buttons on the right lets you adjust the appearance of
the image and overlay as follows:

* Opacity: Drag the slider to adjust the transparency of the volume.

* Cross Section: Drag these sliders to control the cross sectional
  slicing of the image along the sagittal, coronal, and axial planes.

* Threshold: Drag these sliders to adjust the lower and upper bounds of
  the threshold range. This operation converts each voxel in the image
  into black, white, or unchanged depending on whether the original
  color value is within the range.
