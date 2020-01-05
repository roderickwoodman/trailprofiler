## Trailprofiler Overview

GPS trails are fun to plot on a map. But once you have a handful of them from different places, seeing them on maps is not very useful if your goal is to compare them.

But **Trailprofiler** uses elevation plotting to show you your journeys side-by-side on the same chart. With this view, you can compare your climbs from different days with only a quick glance, telling you how much harder your last hike/run/bike really was.

## Additional Features

The core of the app is plotting the information contained in GPX files. But this app also accepts JPG file imports, so that you can see both the data and the photos of where you were grouped together.

The app also lets you correct for certain old-school device errors. It lets you shift the timestamps on photos and GPS trails in case your recording device was off by a timezone or Daylight Savings Time. And it will also detect separate dissimilar chunks of GPS data in case your device logged multiple sessions to the same GPX file. In other words, **Trailprofiler** can account for timestamps that are recorded innacurately, since not everybody's data files were recorded by modern apps running on a modern smartphone.

## Running in Development Mode

From the project directory, run the following shell commands in order to start the app in development mode:

### `npm install`
### `npm run serve`

Then, open [http://localhost:8080](http://localhost:8080) in order to view the app in the browser.

## Vue CLI

Note that this project was bootstrapped with [Vue CLI](https://cli.vuejs.org/).