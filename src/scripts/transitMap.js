import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj';
import { Feature } from 'ol';
import { Circle, LineString, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getLocation } from './domManip';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { agencyList } from './selectors';
import { select } from 'd3-selection';

export default class TransitMap {
    constructor(worker) {
        this.worker = worker;
        useGeographic();

        this.style = new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.7)',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.7)',
                width: 2,
            })
        });

        const tile = new TileLayer({
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
        const vector = new VectorLayer({
            source: this.source,
            style: function (feature) {
                // if (feature.getGeometry().getType() === 'Point') console.log(true);
                const color = feature.get('COLOR') || '#FFFFFF';
                this.style.getStroke().setColor(color);
                return this.style;
            },
        });

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

    drawFeatures(features) {
        this.source.addFeatures(features);
    }

    static featureWrap(geometry) {
        return new Feature({ geometry });
    }

    static featuresWrap(coordinates) {
        return coordinates.map(coordinate => {
            const point = new Point(coordinate);
            return new Feature(point);
        });
    }

    static lineStringWrap(coordinates) {
        return new LineString(coordinates);
    }

    static pointWrap(coordinate) {
        return new Point(coordinate);
    }

    async goToLocation() {
        const { coords } = await getLocation();
        const position = [coords.longitude, coords.latitude];

        const view = this.map.getView();
        view.setCenter(position);
        view.setZoom(15);

        this.drawFeatures([TransitMap.featureWrap(new Point(position))])
    }

    createAgencyLayers(agencies) {
        this.layers = Object.fromEntries(agencies.map(agency => [`agency_${agency['agency_id']}`, null]));
    }

    addFeatures(entry) {
        const [className, features] = entry
        const source = new VectorSource({ features });
        const layer = new VectorLayer({ 
            className, 
            source, 
            style: feature => {
                // if (feature.getGeometry().getType() === 'Point') console.log(true);
                const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
                this.style.getStroke().setColor(color);
                return this.style;
            },
            visible: false
        });

        this.layers[className] = layer;
        this.map.addLayer(layer);
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

    async resetMap() {
        Object.values(this.agencyFeatures).flat().forEach(feature => {
            const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
            feature.setStyle(new Style({
                stroke: new Stroke({
                    width: 2,
                    color
                })
            }));
        });
        Object.values(this.layers).flat().forEach(layer => layer.setVisible(false));
        this.clearAgencyList();
        await this.createAgencyElements();
        const view = this.map.getView();
        view.setCenter([-122.2711639, 37.9743514]);
        view.setZoom(9.5);
    }

    clearAgencyList() {
        agencyList.nodes().forEach(el => Array.from(el.children).forEach(child => child.remove()));
    }

    async createAgencyElements() {
        const agencies = await this.worker.getAll('agency');
        const routes = await this.worker.getAll('routes');

        agencies.forEach((agency, i) => {
            select(agencyList.nodes()[Math.floor(i / (agencies.length / 2))])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(agency['agency_name'])
                .on('mouseenter', () => this.setLayerVisible(agency['agency_id'], true))
                .on('mouseleave', () => this.setLayerVisible(agency['agency_id'], false))
                .on('click', () => {
                    this.goToLayer(agency['agency_id']);
                    this.clearAgencyList();
                    const newRoutes = routes.filter(route => route['agency_id'] === agency['agency_id']);
                    const features = this.agencyFeatures[`agency_${agency['agency_id']}`].filter(feature => feature.get('AGENCY_ID') === agency['agency_id']);
                    newRoutes.forEach((route, i) => {
                        const feature = features.find(feature => feature.get('AGENCY_ID') === agency['agency_id'] && feature.get('ROUTE_ID') === route['route_id']);
                        const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
                        const style = new Style({
                            stroke: new Stroke({
                                width: 2,
                                color
                            })
                        });
                        feature.setStyle(new Style(null));
                        select(agencyList.nodes()[newRoutes.length > 30 ? Math.floor(i / (newRoutes.length / 2)) : 0])
                            .append('li')
                            .append('p')
                            .style('cursor', 'pointer')
                            .text(route['route_short_name'])
                            .attr('title', route['route_long_name'])
                            .on('mouseenter', () => feature.setStyle(style))
                            .on('mouseleave', () => feature.setStyle(new Style(null)));
                    })
                });
        });
    }

    async drawMap() {
        const agencies = await this.worker.getAll('agency');
        console.log('Starting draw calculations.');

        this.agencyFeatures = Object.fromEntries(agencies.map(agency => [`agency_${agency['agency_id']}`, new Array()]));
        const startTime = new Date();
        
        const routes = await this.worker.getAll('routes');
        for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            try {
                // const trips = await this.worker.getWhere('trips', {
                //     agency_id: route['agency_id'], 
                //     route_id: route['route_id']
                // });

                // const shapeCounts = {};
                // for (let j = 0; j < trips.length; j++) {
                //     const trip = trips[j];
                //     const shapesCount = await this.worker.getWhereCount('shapes', {
                //         shape_id: trip['shape_id'],
                //         agency_id: trip['agency_id']
                //     });

                //     // console.log(shapesCount)
                //     shapeCounts[trip['shape_id']] = shapesCount;
                // }
                // Object.entries(shapeCounts).sort(shapeCount => )
                // console.log(shapeCounts)
                
                const trip = await this.worker.getWhereFirst('trips', {
                    agency_id: route['agency_id'], 
                    route_id: route['route_id']
                });
                const points = await this.worker.getWhere('shapes', '[shape_id+agency_id]', [trip['shape_id'], trip['agency_id']]);
                const feature = TransitMap.featureWrap(TransitMap.lineStringWrap(points.sort((a, b) => a['shape_pt_sequence'] - b['shape_pt_sequence']).map(seq => [seq['shape_pt_lon'], seq['shape_pt_lat']])));
                feature.set('COLOR', `#${route['route_color']}`);
                feature.set('AGENCY_ID', route['agency_id']);
                feature.set('ROUTE_ID', route['route_id']);
                feature.set('SHORT_NAME', route['route_short_name']);
                feature.set('LONG_NAME', route['route_long_name']);
                this.agencyFeatures[`agency_${route['agency_id']}`].push(feature);
            } catch(e) {
//                 console.error(`Route threw an error!
// Agency: ${route['agency_id']}
// Route: ${route['route_id']}`, e.toString());
            }
        }

        this.createAgencyLayers(agencies);
        Object.entries(this.agencyFeatures).forEach(this.addFeatures.bind(this));

        const timeElapsed = new Date(new Date() - startTime);
        console.log(`Finished in ${timeElapsed.getSeconds()} sec, ${timeElapsed.getMilliseconds()} ms`);
    }
}