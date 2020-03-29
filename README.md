## Trailprofiler Overview

GPS data is fun to plot on a map. You can really see where you have gone. But if you keep recording your outings, at some point you will have too many trails from too many different locations to fit on the same map. But this is exactly when an elevation plot becomes the right visual for bringing together all of your journeys.

The core of the **Trailprofiler** app is visualizing the information contained in GPX files. But this app also integrates photos from JPG files so that you can add your own visuals to the treks that you logged.

## Imported GPX Files ##

All of the imported GPX files can be plotted side-by-side on the same elevation profile chart. This app also tabulates the metadata from all of these files too. Both the chart and the table are shown on the same dashboard, letting you play with the sortable numeric data and the visual elevation traces at the same time. This is a powerful tool for quantifying how much harder your last hike/run/bike really was.

## Imported JPG Files ##

When an imported JPG file has a (EXIF) timestamp that falls within the time range of the recorded GPX file, then the app will associate the two together. This leads to much stronger visuals and comparisons than either file type alone could.

## Additional Features

The app also lets you correct for certain device-specific recording errors. Not everyone created these files using modern smartphones, and so it is possible for files to be off by multiple timezons or by Daylight Savings Time. But **Trailprofiler** lets you modify the original file data so that you can shift these timestamps. It also will detect separate dissimilar chunks of GPS data in case your legacy device logged multiple sessions to the same GPX file.

## Running in Development Mode

From the project directory, run the following shell commands in order to start the app in development mode:

### `npm install`
### `npm run serve`

Then, open [http://localhost:8080](http://localhost:8080) in order to view the app in the browser.

## Vue CLI

Note that this project was bootstrapped with [Vue CLI](https://cli.vuejs.org/).