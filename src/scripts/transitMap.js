import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getLocation } from './domManip';
import Circle from 'ol/style/Circle';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { agencyList, map } from './selectors';
import { select } from 'd3-selection';
import Timer from './timer';

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
                fill: new Fill({color: 'white'}),
                stroke: new Stroke({
                    color: [255, 255, 255], width: 2
                })
            })
        });

        const tile = new TileLayer({
            preload: 9.5,
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
        window.agencyFeatures = this.agencyFeatures;
        Object.entries(this.agencyFeatures).forEach(this.addFeatures.bind(this));

        drawTimer.stop();
    }

    setLayerVisible(agency_id, bool) {
        this.layers[`agency_${agency_id}`].setVisible(bool);
    }

    goToLayer(agency_id) {
        this.map.getView().fit(this.layers[`agency_${agency_id}`].getSource().getExtent(), {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50]
        });
    }

    goToLine(agency_id, route_id) {
        this.map.getView().fit(this.agencyFeatures[`agency_${agency_id}`].find(feature => feature.get('ROUTE_ID') === route_id).getGeometry().getExtent(), {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50]
        });
    }

    goToStop(agency_id, stop_id) {
        const view = this.map.getView();
        view.setCenter(this.agencyFeatures[`agency_${agency_id}`].find(feature => feature.get('STOP_ID') === stop_id).getGeometry().getCoordinates())
        view.setZoom(16);
    }

    async goToCurrentLocation() {
        const { coords } = await getLocation();
        const view = this.map.getView();
        view.setCenter([coords.longitude, coords.latitude])
        view.setZoom(16);
    }

    resetMap() {
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
        this.clearAgencyList();
        this.createAgencyElements();
        const view = this.map.getView();
        view.setCenter([-122.2711639, 37.9743514]);
        view.setZoom(9.5);
    }

    clearAgencyList() {
        agencyList.nodes().forEach(el => Array.from(el.children).forEach(child => child.remove()));
    }

    createAgencyElements() {
        const agencies = this.transitAccess.execOnAll('SELECT * FROM agency').sort((a, b) => a['agency_name'].localeCompare(b['agency_name']));

        agencies.forEach((agency, i) => {
            const {
                agency_id: agencyId,
                agency_name: agencyName
            } = agency;
            select(agencyList.nodes()[Math.floor(i / (agencies.length / 2))])
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
                    const view = this.map.getView();
                    view.setCenter([-122.2711639, 37.9743514]);
                    view.setZoom(9.5);
                })
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToLayer(agencyId);
                })
                .on('click', () => {
                    this.goToLayer(agencyId);
                    this.clearAgencyList();
                    const routes = this.transitAccess.execOnAgency(agencyId, `
                        SELECT route_id, route_short_name, route_long_name
                        FROM routes
                        ORDER BY route_short_name;
                    `);
                    const features = this.agencyFeatures[`agency_${agencyId}`].filter(feature => feature.get('AGENCY_ID') === agencyId);
                    routes.forEach((route, i) => {
                        const {
                            route_id: routeId,
                            route_short_name: routeShortName,
                            route_long_name: routeLongName,
                        } = route;
                        const routeFeatures = features.filter(feature => feature.get('AGENCY_ID') === agencyId && feature.get('ROUTE_ID') === routeId);
                        
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
                        })
                       
                        select(agencyList.nodes()[routes.length > 30 ? Math.floor(i / (routes.length / 2)) : 0])
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
                                Object.values(this.agencyFeatures).flat().forEach((feature, i) => feature.getGeometry().getType() === 'Point' ? feature.setStyle(this.style) : feature.setStyle(styles[i]));
                                this.goToLayer(agencyId);
                            })
                            .on('contextmenu', e => {
                                e.preventDefault();
                                this.goToLine(agencyId, routeId);
                            })
                            .on('click', () => {
                                this.goToLine(agencyId, routeId);
                                this.clearAgencyList();
                                const stops = routeFeatures.filter(feature => feature.getGeometry().getType() === 'Point').map(feature => {
                                    feature.setStyle(new Style(null));
                                    return {
                                        stopId: feature.get('STOP_ID'),
                                        stopName: feature.get('STOP_NAME'),
                                        feature
                                    }
                                }).sort((a, b) => a['stop_sequence'] - b['stop_sequence']).concat(['all']);
                                stops.forEach((stop, i) => {
                                    if (stop === 'all') {
                                        select(agencyList.nodes()[1])
                                            .append('li')
                                            .append('p')
                                            .style('cursor', 'pointer')
                                            .text('All Stops')
                                            .on('mouseenter', () => stops.slice(0, -1).forEach(stop => stop.feature.setStyle(this.style)))
                                            .on('mouseleave', () => stops.slice(0, -1).forEach(stop => stop.feature.setStyle(new Style(null))))
                                        return;
                                    }
                                    const {
                                        stopId,
                                        stopName
                                    } = stop;
                                    select(agencyList.nodes()[stops.length > 30 ? Math.floor(i / (stops.length / 2)) : 0])
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
                                        .on('click', () => {
                                            this.goToStop(agencyId, stopId);
                                            this.clearAgencyList();
                                            const date = new Date();
                                            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                            const stopTimes = this.transitAccess.execOnAgency(agencyId, `
                                                SELECT strftime('%H:%M', datetime(stop_times.departure_timestamp, 'unixepoch')) departure_time, trip_headsign, stop_headsign
                                                FROM stop_times 
                                                JOIN trips ON trips.trip_id = stop_times.trip_id
                                                JOIN stops ON stops.stop_id = stop_times.stop_id
                                                JOIN routes ON routes.route_id = trips.route_id
                                                JOIN calendar ON trips.service_id = calendar.service_id
                                                WHERE stops.stop_id = "${stopId}"
                                                    AND routes.route_id = "${routeId}"
                                                    AND stop_times.departure_timestamp >= ${(date.getHours() * 60 * 60) + (date.getMinutes() * 60) + date.getSeconds()}
                                                    AND calendar.${days[date.getDay()]} = 1
                                                ORDER BY departure_timestamp 
                                                LIMIT 20;
                                            `);
                                            stopTimes.forEach((stopTime, i) => {
                                                const {
                                                    departure_time: departureTime,
                                                    // trip_headsign: tripHeadsign,
                                                    // stop_headsign: stopHeadsign
                                                } = stopTime;
                                                
                                                select(agencyList.nodes()[0])
                                                    .append('li')
                                                    .append('p')
                                                    // .style('cursor', 'pointer')
                                                    // - ${stopHeadsign ? stopHeadsign : tripHeadsign}
                                                    .text(`${departureTime}`)
                                                    // .attr('title', routeLongName)
                                            })
                                        });
                                });
                            });
                    });
                });
        });
    }
}