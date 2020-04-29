([click here to visit this app on the Internet!](https://roderickwoodman.github.io/trailprofiler/))

## Trailprofiler
*A place to chart and edit together GPX trail files and their associated JPG photo files*

GPS data is fun to plot on a map. You can really see where you have gone. However, if you keep recording your outings, at some point you will have too many trails from too many different locations to fit on the same map. But this is exactly when an elevation plot becomes the right tool for bringing together all of your journeys.

The primary purpose of **Trailprofiler** is for visually comparing the information contained within multiple GPX files. It does this with an elevation plot and a data table. But this app also augments the GPS position and distance data by integrating images from JPG files taken along the way, allowing you to add your own color to the treks that you logged.

### Imported GPX Files ##

All of the imported GPX files can be plotted side-by-side on the same elevation profile chart. In addition, the metadata from all of these files are also shown in a table. Both the chart and the table are part of the same connected dashboard, letting you play with the sortable numeric data and the visual elevation traces at the same time. Both types of data together become a powerful display for quantifying how much harder your last hike/run/bike really was.

### Imported JPG Files ##

Imported JPG files that have an EXIF timestamp belonging to the time range of an imported GPX file will be associated to each other. Seeing your related image thumbnails grouped together helps to strengthen the memory of that hike. Also, device and exposure metadata from each photo can be revealed if any photographers want to get nerdy.

### Additional Features

The app also lets you correct for certain device-specific recording errors. Not everyone created these files by using modern smartphones, and so it is possible for either file type to be off by multiple timezons or by Daylight Savings Time. But **Trailprofiler** lets you modify the original file data so that you can shift these timestamps. It also will detect separate dissimilar chunks of GPS data in case your legacy device logged multiple sessions to the same GPX file. Basically, the app lets you clean up your data files if you need to.

### DISCLAIMER

This app has been designed for the author's needs only, in the author's spare time. By using this app, you are accepting it as-is.

For most people, [the link above](https://roderickwoodman.github.io/trailprofiler/) will take you to the live, production version of the app on the Internet. At the moment however, because of technical reasons, image thumbnail generation is not yet supported and many so most of the image functionality is hardcoded to static, development images.

For developers, be aware that there is no backend server for this app. So, based on this deployment design, thumbnail generation is not yet possible.

### Running Locally

This app was bootstrapped with [Vue CLI](https://cli.vuejs.org/).

As with other Vue CLI projects, from the project directory you can run:

#### `npm install`
#### `npm run serve`

This runs the app in the development mode.<br> 
 Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.