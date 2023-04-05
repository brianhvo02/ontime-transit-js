import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fadeIn, fadeInMain, fadeInWelcome, fadeOut, fadeOutList, getLocation } from './domManip';
import Circle from 'ol/style/Circle';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { backButton, list, loading, main, map } from './selectors';
import { select } from 'd3-selection';
import Timer from './timer';
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import localforage from 'localforage';
import { containsXY } from 'ol/extent';

export default class TransitMap {
    constructor(access) {
        this.transitAccess = access;
        useGeographic();

        this.style = new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.7)',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.7)',
                width: 2,
            }),
            image: new Circle({
                radius: 2,
                fill: new Fill({
                    color: 'rgba(211, 211, 211, 0.8)'
                }),
                stroke: new Stroke({
                    color: [211, 211, 211], 
                    width: 2
                })
            })
        });

        const tile = new TileLayer({
            preload: Infinity,
            source: new OSM()
        });

        tile.on('postrender', (evt) => {
            if (evt.context) {
                evt.context.globalCompositeOperation = 'color';
                evt.context.fillStyle = 'rgba(0, 0, 0,' + 1.0 + ')';
                evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
                evt.context.globalCompositeOperation = 'overlay';
                evt.context.fillStyle = 'rgb(' + [200, 200, 200].toString() + ')';
                evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
                evt.context.globalCompositeOperation = 'source-over';
                evt.context.canvas.style.filter = "invert(99%)";
            }
        });

        this.source = new VectorSource();
        const vector = new VectorLayer({ source: this.source });

        this.map = new Map({
            target: 'map',
            loadTilesWhileAnimating: true,
            layers: [
                tile,
                vector
            ],
            view: new View({
                center: [-122.2711639, 37.9743514],
                zoom: 9.5,
            }),
            controls: []
        });

        this.loaded = false;
        this.map.on('movestart', () => {
            backButton.style('pointer-events', 'none');
            list.style('pointer-events', 'none');
        });
        this.map.on('moveend', () => {
            backButton.style('pointer-events', 'auto');
            list.style('pointer-events', 'auto');
        });
        this.map.on('rendercomplete', () => {
            if (!this.loaded) {
                this.loaded = true;
                fadeOut(backButton);
                localStorage.getItem('agencies') ? fadeInMain(this) : fadeInWelcome();
            }
        });

        document.querySelector('.fa-circle-arrow-left').addEventListener('click', this.handleBack.bind(this));
        document.querySelector('.fa-train-subway').addEventListener('click', this.createAgencyElements.bind(this));
        document.querySelector('.fa-location-dot').addEventListener('click', this.goToCurrentLocation.bind(this));
        document.querySelector('.fa-map-location-dot').addEventListener('click', () => fadeOut(main));
    }

    distanceRange(coord, dist = 1) {
        const [lon, lat] = coord;
        const latDist = dist / 69;
        const lonDist = dist / (Math.cos(lat * Math.PI / 180) * 69.172);
        return [lon - lonDist, lat - latDist, lon + lonDist, lat + latDist];
    }

    addFeatures(entry) {
        const [className, features] = entry;
        const source = new VectorSource({ features });
        const layer = new VectorLayer({ 
            className, 
            source, 
            style: feature => {
                // if (feature.getGeometry().getType() === 'Point') console.log(feature.get('COLOR'));
                const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
                this.style.getStroke().setColor(color);
                return this.style;
            }
        });

        this.layers[className] = layer;
        this.map.addLayer(layer);
    }

    drawMap() {
        const drawTimer = new Timer('draw map');
        console.log('Starting draw calculations.');

        this.agencyFeatures = Object.fromEntries(this.transitAccess.agencies.map(agency => [`agency_${agency['Id']}`, new Array()]));

        const routes = this.transitAccess.execOnAll('SELECT * FROM routes');
        routes.forEach(route => {
            // try {
                const line = this.transitAccess.execOnAgency(route['agency_id'], `
                    SELECT shape_id, shape_pt_lon, shape_pt_lat
                    FROM shapes
                    WHERE shape_id = (
                        SELECT shape_id
                        FROM (
                            SELECT shape_id, MAX(shape_count)
                            FROM (
                                SELECT shape_id, COUNT(*) AS shape_count
                                FROM shapes 
                                WHERE shape_id IN (
                                    SELECT shape_id
                                    FROM trips
                                    WHERE route_id = "${route['route_id']}"
                                ) GROUP BY shape_id
                            )
                        )
                    )
                    ORDER BY shape_pt_sequence;
                `);

                if (line.length === 0) return;

                const linePoints = line.map(coordinates => [ coordinates['shape_pt_lon'], coordinates['shape_pt_lat'] ]);
                const lineFeature = new Feature(new LineString(linePoints));
                lineFeature.set('COLOR', `#${route['route_color']}`);
                lineFeature.set('AGENCY_ID', route['agency_id']);
                lineFeature.set('ROUTE_ID', route['route_id']);
                lineFeature.set('SHORT_NAME', route['route_short_name']);
                lineFeature.set('LONG_NAME', route['route_long_name']);
                const stops = this.transitAccess.execOnAgency(route['agency_id'], `
                    SELECT stops.stop_id, stop_name, stop_lon, stop_lat, stop_sequence
                    FROM stop_times
                    JOIN stops ON stops.stop_id = stop_times.stop_id
                    WHERE trip_id = (
                        SELECT trip_id
                            FROM trips
                            WHERE shape_id = "${line[0]['shape_id']}"
                            LIMIT 1
                    )
                    ORDER BY stop_sequence
                `);

                const stopFeatures = stops.map(stop => {
                    const stopPoint = [ stop['stop_lon'], stop['stop_lat'] ];
                    const stopFeature = new Feature(new Point(stopPoint));
                    stopFeature.set('COLOR', `#FFFFFF`);
                    stopFeature.set('AGENCY_ID', route['agency_id']);
                    stopFeature.set('ROUTE_ID', route['route_id']);
                    stopFeature.set('STOP_ID', stop['stop_id']);
                    stopFeature.set('STOP_NAME', stop['stop_name']);
                    stopFeature.set('STOP_SEQUENCE', stop['stop_sequence']);
                    stopFeature.setStyle(new Style(null));
                    return stopFeature;
                });

                this.agencyFeatures[`agency_${route['agency_id']}`].push(lineFeature, ...stopFeatures);
//             } catch(e) {
//                 console.error(`Route threw an error!
// Agency: ${route['agency_id']}
// Route: ${route['route_id']}`, e.toString());
//             }
        });

        this.layers = Object.fromEntries(this.transitAccess.agencies.map(agency => [`agency_${agency['Id']}`, null]));
        Object.entries(this.agencyFeatures).forEach(this.addFeatures.bind(this));

        drawTimer.stop();
    }

    setLayerVisible(agency_id, bool) {
        this.layers[`agency_${agency_id}`].setVisible(bool);
    }

    goToLayer(agency_id) {
        this.map.getView().fit(this.layers[`agency_${agency_id}`].getSource().getExtent(), {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50],
            duration: 1000
        });
    }

    goToLine(agency_id, route_id) {
        this.map.getView().fit(this.agencyFeatures[`agency_${agency_id}`].find(feature => feature.get('ROUTE_ID') === route_id).getGeometry().getExtent(), {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50],
            duration: 1000
        });
    }

    goToStop(agency_id, stop_id) {
        this.map.getView().animate({
            center: this.agencyFeatures[`agency_${agency_id}`].find(feature => feature.get('STOP_ID') === stop_id).getGeometry().getCoordinates(),
            zoom: 16,
            duration: 1000
        })
    }

    async goToCurrentLocation() {
        this.resetMap(true);
        fadeIn(loading, true);

        if (!this.coords) {
            const { coords } = await getLocation();
            this.coords = coords;
        }

        const extent = this.distanceRange([this.coords.longitude, this.coords.latitude])
        
        this.map.getView().fit(extent, {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50],
            duration: 1000
        });

        const feature = new Feature(new Point([this.coords.longitude, this.coords.latitude]));
        feature.setStyle(new Style({
            image: new Circle({
                radius: 8,
                fill: new Fill({
                    color: 'rgb(66, 133, 244)'
                }),
                stroke: new Stroke({
                    color: [255, 255, 255], 
                    width: 2
                })
            })
        }));
        
        this.map.addLayer(new VectorLayer({
            source: new VectorSource({
                features: [ feature ]
            })
        }));
            

        fadeOut(loading);

        const features = Object.values(this.agencyFeatures).flat().filter(feature => containsXY(extent, ...feature.getGeometry().getCoordinates()));
        const styles = features.map(feature => {
            const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
            const style = new Style({
                stroke: new Stroke({
                    width: 2,
                    color
                })
            });
            return style;
        });

        features.forEach((feature, i) => feature.getGeometry().getType() === 'Point' ? feature.setStyle(this.style) : feature.setStyle(styles[i]));
        this.createCurrentLocationStopElements(features);
    }

    resetMap(currentLocation = false) {
        Object.values(this.agencyFeatures).flat().forEach(feature => {
            const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
            feature.setStyle(new Style({
                stroke: new Stroke({
                    width: 2,
                    color
                })
            }));
        });
        Object.values(this.layers).flat().forEach(layer => layer.setVisible(true));
        if (!currentLocation) {
            this.map.getView().animate({
                center: [-122.2711639, 37.9743514],
                zoom: 9.5,
                duration: 1000
            });
        }
    }

    clearList() {
        list.nodes().forEach(el => Array.from(el.children).forEach(child => child.remove()));
    }

    handleBack() {
        switch (this.currentState) {
            case 'agencies':
                break;

            case 'routes':
                this.createAgencyElements();
                break;

            case 'stops':
                const [stopsAgencyId] = select('.list > li > p').node().dataset['stopData'].split(',');
                this.createRouteElements(stopsAgencyId);
                break;

            case 'currentLocationStops':
                this.createAgencyElements();
                break;
            
            case 'stopTimes':
                const [stopTimesAgencyId, stopTimesRouteId] = select('.list > li > p').node().dataset['stopTimeData'].split(',');
                this.createStopElements(stopTimesAgencyId, stopTimesRouteId);
                break;
            
                // const [stopTimesAgencyId, stopTimesRouteId, stopTimesStopId] = select('li').node().dataset['agencyId,routeId,stopId'].split(',');
                // this.createStopElements(stopTimesAgencyId, stopTimesRouteId, stopTimesStopId);

            default:
                break;
        }
    }

    createAgencyElements() {
        this.currentState = 'agencies';
        this.clearList();
        this.resetMap();
        fadeOut(backButton);
        
        const agencies = this.transitAccess.execOnAll(`
            SELECT * 
            FROM agency
        `).sort((a, b) => a['agency_name'].localeCompare(b['agency_name']));
        agencies.forEach((agency, i) => {
            const {
                agency_id: agencyId,
                agency_name: agencyName
            } = agency;
            select(list.nodes()[Math.floor(i / (agencies.length / 2))])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(agencyName)
                .on('mouseenter', () => {
                    Object.values(this.layers).forEach(layer => layer.setVisible(false))
                    this.setLayerVisible(agencyId, true);
                    // this.goToLayer(agencyId);
                })
                .on('mouseleave', () => {
                    // this.setLayerVisible(agencyId, false);
                    Object.values(this.layers).forEach(layer => layer.setVisible(true))
                    this.map.getView().animate({
                        center: [-122.2711639, 37.9743514],
                        zoom: 9.5,
                        duration: 1000
                    });
                })
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToLayer(agencyId);
                })
                .on('click', () => this.createRouteElements(agencyId));
        });
    }

    createRouteElements(agencyId) {
        this.currentState = 'routes';
        this.clearList();
        this.goToLayer(agencyId);
        fadeIn(backButton);
        const routes = this.transitAccess.execOnAgency(agencyId, `
            SELECT route_id, route_short_name, route_long_name
            FROM routes
            ORDER BY route_short_name;
        `);
        const features = this.agencyFeatures[`agency_${agencyId}`];
        routes.forEach((route, i) => {
            const {
                route_id: routeId,
                route_short_name: routeShortName,
                route_long_name: routeLongName,
            } = route;
            const routeFeatures = features.filter(feature => feature.get('ROUTE_ID') === routeId);
            
            const styles = routeFeatures.map(feature => {
                const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
                const style = new Style({
                    stroke: new Stroke({
                        width: 2,
                        color
                    })
                });
                feature.setStyle(new Style(null));
                return style;
            });

            routeFeatures.forEach((feature, i) => feature.getGeometry().getType() === 'Point' ? feature.setStyle(new Style(null)) : feature.setStyle(styles[i]));
            
            select(list.nodes()[routes.length > 30 ? Math.floor(i / (routes.length / 2)) : 0])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(routeShortName)
                .attr('title', routeLongName)
                .on('mouseenter', () => {
                    Object.values(this.agencyFeatures).flat().forEach(feature => feature.setStyle(new Style(null)));
                    routeFeatures.forEach((feature, i) => feature.getGeometry().getType() === 'Point' ? feature.setStyle(this.style) : feature.setStyle(styles[i]));
                })
                .on('mouseleave', () => {
                    // this.setLayerVisible(agencyId, false);
                    routeFeatures.forEach(feature => feature.setStyle(new Style(null)));
                    Object.values(this.agencyFeatures).flat().forEach((feature, i) => feature.getGeometry().getType() === 'Point' ? feature.setStyle(new Style(null)) : feature.setStyle(styles[i]));
                    this.goToLayer(agencyId);
                })
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToLine(agencyId, routeId);
                })
                .on('click', () => this.createStopElements(agencyId, routeId))
                .node().dataset['routeData'] = agencyId;
        });
    }

    createStopElements(agencyId, routeId) {
        this.currentState = 'stops';
        fadeIn(backButton);
        this.clearList();
        this.goToLine(agencyId, routeId);
        const stops = this.agencyFeatures[`agency_${agencyId}`]
            .filter(feature => feature.get('ROUTE_ID') === routeId && feature.getGeometry().getType() === 'Point')
            .map(feature => {
                feature.setStyle(new Style(null));
                return {
                    stopId: feature.get('STOP_ID'),
                    stopName: feature.get('STOP_NAME'),
                    feature
                }
            })
            .sort((a, b) => a['stop_sequence'] - b['stop_sequence']).concat(['all']);
        stops.forEach((stop, i) => {
            if (stop === 'all') {
                select(list.nodes()[1])
                    .append('li')
                    .append('p')
                    .style('cursor', 'default')
                    .text('All Stops')
                    .on('mouseenter', () => stops.slice(0, -1).forEach(stop => stop.feature.setStyle(this.style)))
                    .on('mouseleave', () => stops.slice(0, -1).forEach(stop => stop.feature.setStyle(new Style(null))))
                return;
            }
            const {
                stopId,
                stopName
            } = stop;
            select(list.nodes()[stops.length > 30 ? Math.floor(i / (stops.length / 2)) : 0])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(stopName)
                .on('mouseenter', () => stop.feature.setStyle(this.style))
                .on('mouseleave', () => {
                    stop.feature.setStyle(new Style(null));
                    this.goToLine(agencyId, routeId);
                })
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToStop(agencyId, stopId);
                })
                .on('click', () => this.createStopTimeElements(agencyId, routeId, stopId))
                .node().dataset['stopData'] = [agencyId, routeId].join(',');
        });
    }

    createCurrentLocationStopElements(features) {
        this.currentState = 'currentLocationStops';
        fadeIn(backButton);
        this.clearList();
        const agencyFeatures = features.reduce((acc, feature) => {
            if (feature.getGeometry().getType() === 'Point') {
                if (acc[feature.get('AGENCY_ID')]) {
                    acc[feature.get('AGENCY_ID')].push(feature);
                } else {
                    acc[feature.get('AGENCY_ID')] = [ feature ];
                }
            }

            return acc;
        }, {});
        Object.keys(agencyFeatures).map(agencyId => {
            const features = agencyFeatures[agencyId].sort((a, b) => a.get('STOP_NAME').localeCompare(b.get('STOP_NAME')));
            features.forEach((feature, i) => {
                const stopId = feature.get('STOP_ID');
                const stopName = feature.get('STOP_NAME');
                const routeId = feature.get('ROUTE_ID')
                const {
                    route_short_name: routeShortName, 
                    route_long_name: routeLongName
                } = this.transitAccess.execOnAgency(agencyId, `
                    SELECT route_short_name, route_long_name
                    FROM routes
                    WHERE route_id = "${routeId}"
                    LIMIT 1
                `)[0];
                select(list.nodes()[features.length > 30 ? Math.floor(i / (features.length / 2)) : 0])
                    .append('li')
                    .append('p')
                    .style('cursor', 'pointer')
                    .html(`${stopName}<br>${routeShortName} (${routeLongName})`)
                    .on('mouseenter', () => this.goToStop(agencyId, stopId))
                    .on('click', () => {
                        features.forEach(feature => feature.get('STOP_ID') !== stopId ? feature.setStyle(new Style(null)) : null);
                        this.createStopTimeElements(agencyId, routeId, stopId)
                    });
            })
            
        });
    }

    async createStopTimeElements(agencyId, routeId, stopId) {
        this.currentState = 'stopTimes';
        this.goToStop(agencyId, stopId);
        this.clearList();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        const createElements = async ignoreOtherRoutes => {
            this.clearList();
            fadeIn(loading, true);

            const date = new Date();

            let stopRealTimesBuf = await localforage.getItem(`${agencyId}_realtime`);
            let stopRealTimesTimestamp = await localforage.getItem(`${agencyId}_realtime_timestamp`);
            if (!(stopRealTimesTimestamp && stopRealTimesBuf && stopRealTimesTimestamp + 300000 > date.getTime())) {
                stopRealTimesBuf = await fetch(`https://api.511.org/transit/tripupdates?api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7&agency=${agencyId}`).then(res => res.arrayBuffer());
                await localforage.setItem(`${agencyId}_realtime`, stopRealTimesBuf);
                stopRealTimesTimestamp = date.getTime();
                await localforage.setItem(`${agencyId}_realtime_timestamp`, stopRealTimesTimestamp);
            }

        const routeShortName = this.transitAccess.execOnAgency(agencyId, `
            SELECT route_short_name
            FROM routes
            WHERE route_id = "${routeId}"
            LIMIT 1
        `)[0]['route_short_name'];
        
        const stopTimesFiltered = this.transitAccess.execOnAgency(agencyId, `
            SELECT time(stop_times.departure_timestamp, 'unixepoch') departure_time, trip_headsign, stop_headsign, trips.trip_id
            FROM stop_times 
            JOIN trips ON trips.trip_id = stop_times.trip_id
            JOIN stops ON stops.stop_id = stop_times.stop_id
            JOIN routes ON routes.route_id = trips.route_id
            LEFT OUTER JOIN calendar ON trips.service_id = calendar.service_id
            WHERE stops.stop_id = "${stopId}"
                AND routes.route_id = "${routeId}"
                AND stop_times.departure_timestamp >= ${date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()}
                AND (
                    trips.service_id IN (
                        SELECT service_id
                        FROM calendar_dates 
                        WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate()}"
                            AND exception_type = 1
                    )
                    OR (
                        trips.service_id NOT IN (
                            SELECT service_id
                            FROM calendar_dates 
                            WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate()}"
                                AND exception_type = 2
                        )
                        AND ${days[date.getDay()]} = 1
                    )
                )
            ORDER BY departure_timestamp 
            LIMIT 30;
        `);

        const stopTimes = this.transitAccess.execOnAgency(agencyId, `
            SELECT time(stop_times.departure_timestamp, 'unixepoch') departure_time, trip_headsign, stop_headsign, trips.trip_id, routes.route_id, routes.route_short_name
            FROM stop_times 
            JOIN trips ON trips.trip_id = stop_times.trip_id
            JOIN stops ON stops.stop_id = stop_times.stop_id
            JOIN routes ON routes.route_id = trips.route_id
            LEFT OUTER JOIN calendar ON trips.service_id = calendar.service_id
            WHERE stops.stop_id = "${stopId}"
                AND stop_times.departure_timestamp >= ${date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()}
                AND (
                    trips.service_id IN (
                        SELECT service_id
                        FROM calendar_dates 
                        WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate()}"
                            AND exception_type = 1
                    )
                    OR (
                        trips.service_id NOT IN (
                            SELECT service_id
                            FROM calendar_dates 
                            WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate()}"
                                AND exception_type = 2
                        )
                        AND ${days[date.getDay()]} = 1
                    )
                )
            ORDER BY departure_timestamp 
            LIMIT 30;
        `);
        
            const stopRealTimes = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(stopRealTimesBuf)).entity;
            const rightColumn = select(list.nodes()[1]);

            rightColumn
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(`See stop times for ${routeShortName}.`)
                .on('click', () => createElements(true));

            rightColumn
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text('See stop times for all routes.')
                .on('click', () => createElements(false));

            (ignoreOtherRoutes ? stopTimesFiltered : stopTimes).forEach((stopTime, i) => {
                const {
                    departure_time: departureTime,
                    trip_headsign: tripHeadsign,
                    stop_headsign: stopHeadsign,
                    trip_id: tripId,
                    route_short_name: routeShortName,
                    route_id: tripRouteId
                } = stopTime;

                if (ignoreOtherRoutes && i === 0) {
                    this.agencyFeatures[`agency_${agencyId}`]
                        .filter(feature => feature.get('ROUTE_ID') !== routeId && feature.getGeometry().getType() === 'LineString')
                        .forEach(feature => feature.setStyle(new Style(null)));
                }

                if (!ignoreOtherRoutes) {
                    const feature = this.agencyFeatures[`agency_${agencyId}`].find(feature => feature.get('ROUTE_ID') === tripRouteId && feature.getGeometry().getType() === 'LineString')

                    const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
                    const style = new Style({
                        stroke: new Stroke({
                            width: 2,
                            color
                        })
                    });
                    feature.setStyle(style);
                }

                try {
                    const updatedTimeEntity = stopRealTimes.find(entity => entity.id === tripId);
                    const updatedTime = updatedTimeEntity ? updatedTimeEntity.tripUpdate.stopTimeUpdate.find(stopTimeUpdate => stopTimeUpdate.stopId === stopId) : null;
                    const time = updatedTime && updatedTime.departure
                        ? new Date(updatedTime.departure.time * 1000)
                        : (
                            updatedTime && updatedTime.arrival 
                                ? new Date(updatedTime.arrival.time * 1000)
                                : new Date('0 ' + departureTime)
                        );

                    const timeElapsedMinutes = time.getMinutes() - date.getMinutes();
                    let timeElapsedHours = time.getHours() - date.getHours() - (timeElapsedMinutes < 0 ? 1 : 0);
                    timeElapsedHours = timeElapsedHours < 0 ? 24 + timeElapsedHours : timeElapsedHours;
                    
                    select(list.nodes()[0])
                        .append('li')
                        .append('p')
                        // .style('cursor', 'pointer')
                        .html(`${time.toLocaleTimeString('en-US')}, in ${timeElapsedHours === 0 ? '' : `${timeElapsedHours} hrs, `}${timeElapsedMinutes < 0 ? 60 + timeElapsedMinutes : timeElapsedMinutes} mins${ignoreOtherRoutes ? '' : `<br>${routeShortName} (${stopHeadsign ? stopHeadsign : tripHeadsign})`}`)
                        // .attr('title', routeLongName)
                        .node().dataset['stopTimeData'] = [agencyId, routeId, stopId].join(',');
                } catch (e) {
                    console.error(e);
                }
            });

            fadeOut(loading);
        }

        createElements(true);
    }
}