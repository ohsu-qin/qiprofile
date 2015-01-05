This page displays the Imaging and Clinical profiles side by side.

ImagingProfile
--------------
On the left, the Imaging Profile displays a summary patient timeline
and the modeling results.

The MR Visit Timeline shows the MR sessions in the context of the
patient encounters and treatments. The visit dates are shown below
the X axis. The visit numbers are shown above the X axis. Clicking
on a visit number opens the Session Detail page.

The pharmokinetic modeling results are displayed below the timeline.
The <span class="glyphicon glyphicon-list"></span> button toggles
between the modeling result chart and table presentation format.
When the tables are displayed, the
<span class="glyphicon glyphicon-stat"></span> button toggles
back to the chart format.

Clicking the InputParameters
<span class="glyphicon glyphicon-info-sign"></span>
button shows the modeling input parameters.

The following PK modeling results are displayed:

* K<sup>trans</sup>: the vascular permeability transfer constant
  for the FXL (standard) and FXR (shutter speed) models.

* v<sub>e</sub>: the FXR extravascular extracellular volume fraction

* &tau;<sub>i</sub>: the FXR intracellular H<sub>2</sub>O mean lifetime

Clinical Profile
----------------
On the right, the Clinical Profile displays the patient demographics
followed by the patient encounter outcomes. Each outcome panel shows
the encounter type, e.g. Biopsy, encounter date and the outcomes.
The Tumor Staging panel shows the TNM scores, Stage and Grade.
The grade is computed from the detailed grade for the specific
tumor type, e.g. the ModifiedBloomRichardson Grade for a breast tumor.
The stage is then computed from the size, lymph status and
TNM grade.
