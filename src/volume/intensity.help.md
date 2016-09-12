The Intensity Tracker depicts the intensity at the current coordinate
over time. The voxel intensity values at the coordinate are shown as
both a line and a color bar for each visited time point.

Time points which have not yet been visited are omitted. Thus, when
the Time Series Detail page is first opened, the line is not shown
since it only has one time point, and the color bar shows a single
color. Clicking on the Time Point play button will progressively
show the additional time point intensities as the volumes are loaded.
Gaps in the loaded volumes appear as gaps in the line and color bar.

The implicit line Y axis is scaled from zero to the maximal time
series intensity. The implicit X axis is scaled by the time points.

The color bar is similarly implicitly scaled the same as the line Y
axis but is mapped to the
<a href="https://bids.github.io/colormap/images/screenshots/option_b.png"
   target="_blank"
>
  Inferno
</a>
black-to-yellow color map (black = 0, yellow = maximum).

Repositioning the Image view crosshairs to a different coordinate
updates the intensity values for the selected coordinate.
