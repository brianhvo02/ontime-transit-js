# OnTime Transit - Bay Area Transit Data Visualizer

## Background

OnTime Transit is a data visualization project to allow users to translate data given by California's [Metropolitan Transportation Commission (MTC)](https://mtc.ca.gov) to a human-readable format in the browser using JavaScript and third-party libraries. It downloads the [General Transit Feed Specification (GTFS)](https://developers.google.com/transit) feeds consolidated by 511 SF Bay from all feeds provided transit services, unzips it in the user's browser using zip.js, and stores the data locally using the IndexedDB API. From there, users will be able visualize specific statistics from this data using D3.js, such as lines and stops for a provider and how often trains come into a station. Users will also be able to view the Realtime GTFS data for live data from the transit service providers and visualize statistics from that live data, as well as view lines and current vehicle positions on a map using OpenLayers.

## Functionality

With OnTime, users will be able to:
- See what transit authorities are in the Bay Area with GTFS feeds available to consume
- Find lines, stops, timetables, and scheduled departures for all provided transit services
- Find realtime data of current trips, vehicle locations, and updated departure times
- View charts and tables based on statistics generated from both static and realtime GTFS sources
- Explore options with transit, such as directions or fares between stops (TENTATIVE)

## Wireframes

![wireframe](https://github.com/brianhvo02/ontime-transit/raw/main/wireframe.png)

- Left navigation bar will feature different data views for the various transit agencies, as well as a link to the projects Github repository
- Right gear will be a dropdown menu to configure any filters for the data
- Background will be a map, which the user will be able to control by selecting stations, buses, etc.

## Libraries and APIs

- [Dexie.js](https://dexie.org) - a minimalistic wrapper for IndexedDB
	- [Apache License](https://github.com/dexie/Dexie.js/blob/master/LICENSE)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - low-level JavaScript API for client-side storage of significant amounts of structured data
- [Webpack](https://webpack.js.org) & [Babel](https://babeljs.io) - used bundle and transpile the source JavaScript code
	- MIT License ([Webpack](https://github.com/webpack/webpack/blob/main/LICENSE)) ([Babel](https://github.com/babel/babel/blob/main/LICENSE))
- [zip.js](https://gildas-lormeau.github.io/zip.js) - JavaScript library to zip and unzip files in the browser
- [D3.js](https://d3js.org/) - JavaScript library for manipulating documents based on data
	- [ISC License](https://github.com/d3/d3/blob/main/LICENSE)
- [OpenLayers](https://openlayers.org) - JavaScript library for displaingy map tiles, vector data and markers loaded from any source
	- [BSD 2-Clause License](https://github.com/openlayers/openlayers/blob/main/LICENSE.md)
- [511 Open Transit Data](https://511.org/open-data/transit) - 511’s Open Data for Bay Area transit authorities
	- [Data Use Agreement](https://511.org/sites/default/files/pdfs/511_Data_Agreement_Final.pdf)

## Implementation Timeline

### Friday Afternoon & Weekend

Setup project, including getting webpack up and running. Work on initial single page layout with navigation sidebar, header, and footer. Setup selector variables and handles. Spend time getting comfortable with the GTFS specification as well as preparing to work on downloading the GTFS zip file and loading it into the IndexDB. Familiarize with the IndexDB API and how relations between data will affect data manipulation. Create `TransitAccess` class to create interface between the 511 API, client database, and client browser. Create a `TransitData` class to extrapolate meaningful data from the GTFS data. Create the OpenLayers map and a `TransitMap` class to regulate operations on the map based on GTFS data. Create a `TransitModel` class to represent different data models based on GTFS data.
    
### Monday
Use the whole day to implement connections between all data elements of the project. Connect the `TransitAccess` class with the `TransitMap`, `TransitData`, and `TransitModel` classes, as well as fleshing out the connection between those classes and the HTML page. Continue working on the classes if they weren't finished over the weekend.
    
### Tuesday
Focus on styling and implementing color schemes. Polish design elements of the page while keeping navigability in mind. Continue implementing connections between data elements if not completed on Monday.
    
### Wednesday
Ask for input on the overall navigability of the application from different people. Begin migration to a semi-production environment to start testing UI/UX. Continue to improve and polish existing code.
    
### Thursday Morning
Deploy to GitHub pages. If time, rewrite this proposal as a production README.

## Checklist

### Live Project

- [ ] Includes links to your portfolio website, Github, and LinkedIn.

- [ ] Landing page/modal with obvious, clear instructions.

- [ ] Interactivity of some kind.

- [ ] Well styled, clean frontend.

- [ ] If it has music, the option to mute or stop it.

### Production README

- [ ] Link to live version.

- [ ] Instructions on how to play/interact with the project.

- [ ] List of technologies / libraries / APIs used.

- [ ] Technical implementation details with (good-looking) code snippets.

- [ ] To-dos / future features.

- [ ] No  **.DS_Store**  files / debuggers / console.logs.

- [ ] Organized file structure, with  **/src**  and  **/dist**  directories.