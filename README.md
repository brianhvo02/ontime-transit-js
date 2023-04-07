# OnTime Transit - Bay Area Transit Data Visualizer

## Background

OnTime Transit is a data visualization project to allow users to translate data given by California's [Metropolitan Transportation Commission (MTC)](https://mtc.ca.gov) to a human-readable format in the browser using JavaScript and third-party libraries. Uses the [General Transit Feed Specification (GTFS)](https://developers.google.com/transit) feeds consolidated by 511 SF Bay from all feeds provided transit services.

[Try it now!](https://brianhvo02.github.io/ontime-transit/)

## Overview

With OnTime, users will be able to:
- See what transit authorities are in the Bay Area with GTFS feeds available to consume
- Find lines, stops, timetables, and scheduled departures for all provided transit services
- Find realtime data of current trips, vehicle locations, and updated departure times
- TODO: Generate statistics based on static and realtime data

## Instructions

- The train logo in the top of the screen is your home button! Use it to come back to the initial agency selection screen.
- The back button will take you one layer back up (i.e. routes -> agencies, stops -> routes).
- The Github icon will take you to the Github repository this app is stored in.
- The pause button will pause the transit alerts banner that scrolls through the screen.
- The marker button will take you to your current location.
- The map button will make the top layer disappear so you can explore the map.
- The info button will show you the welcome screen with instructions.
- Click on a space of the map with no features and it will take you to an overview of the layer you're in.
- Click on a feature to bring up the relevant data for that feature.
- Hover over a link to highlight the feature on the map.
- Right-click on a link to zoom to that specific feature.

## Libraries and APIs

- [nodeGTFS](https://github.com/blinktaginc/node-gtfs) - loads transit data in GTFS format into a SQLite database
- [gtfs-to-geojson](https://github.com/blinktaginc/gtfs-to-geojson) -  converts transit data in GTFS format into geoJSON
- [localForage](https://github.com/localForage/localForage) - a fast and simple storage library for JavaScript
- [Webpack](https://webpack.js.org) & [Babel](https://babeljs.io) - used bundle and transpile the source JavaScript code
	- MIT License ([Webpack](https://github.com/webpack/webpack/blob/main/LICENSE)) ([Babel](https://github.com/babel/babel/blob/main/LICENSE))
- [zip.js](https://gildas-lormeau.github.io/zip.js) - JavaScript library to zip and unzip files in the browser
- [D3.js](https://d3js.org/) - JavaScript library for manipulating documents based on data
	- [ISC License](https://github.com/d3/d3/blob/main/LICENSE)
- [OpenLayers](https://openlayers.org) - JavaScript library for displaingy map tiles, vector data and markers loaded from any source
	- [BSD 2-Clause License](https://github.com/openlayers/openlayers/blob/main/LICENSE.md)
- [511 Open Transit Data](https://511.org/open-data/transit) - 511’s Open Data for Bay Area transit authorities
	- [Data Use Agreement](https://511.org/sites/default/files/pdfs/511_Data_Agreement_Final.pdf)