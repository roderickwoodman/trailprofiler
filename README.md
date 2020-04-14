## Trailprofiler Overview

GPS data is fun to plot on a map. You can really see where you have gone. However, if you keep recording your outings, at some point you will have too many trails from too many different locations to fit on the same map. But this is exactly when an elevation plot becomes the right tool for bringing together all of your journeys.

The primary purpose of **Trailprofiler** is for visually comparing the information contained within multiple GPX files. It does this with an elevation plot and a data table. But this app also augments the GPS position and distance data by integrating images from JPG files taken along the way, allowing you to add your own color to the treks that you logged.

## Imported GPX Files ##

All of the imported GPX files can be plotted side-by-side on the same elevation profile chart. In addition, the metadata from all of these files are also shown in a table. Both the chart and the table are part of the same connected dashboard, letting you play with the sortable numeric data and the visual elevation traces at the same time. Both types of data together become a powerful display for quantifying how much harder your last hike/run/bike really was.

## Imported JPG Files ##

Imported JPG files that have an EXIF timestamp belonging to the time range of an imported GPX file will be associated to each other. Seeing your related image thumbnails grouped together helps to strengthen the memory of that hike. Also, device and exposure metadata from each photo can be revealed if any photographers want to get nerdy.

## Additional Features

The app also lets you correct for certain device-specific recording errors. Not everyone created these files by using modern smartphones, and so it is possible for either file type to be off by multiple timezons or by Daylight Savings Time. But **Trailprofiler** lets you modify the original file data so that you can shift these timestamps. It also will detect separate dissimilar chunks of GPS data in case your legacy device logged multiple sessions to the same GPX file. Basically, the app lets you clean up your data files if you need to.

## Running in Development Mode

From the project directory, run the following shell commands in order to start the app in development mode:

### `npm install`
### `npm run serve`

Then, open [http://localhost:8080](http://localhost:8080) in order to view the app in the browser.

## Vue CLI

Note that this project was bootstrapped with [Vue CLI](https://cli.vuejs.org/).