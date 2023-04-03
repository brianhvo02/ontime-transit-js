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

    addFeatures(entry) {
        const [className, features] = entry;
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

    drawMap() {
        const drawTimer = new Timer('draw map');
        console.log('Starting draw calculations.');

        this.agencyFeatures = Object.fromEntries(this.transitAccess.agencies.map(agency => [`agency_${agency['Id']}`, new Array()]));

        const routes = this.transitAccess.execOnAll('SELECT * FROM routes');
        routes.forEach(route => {
            try {
                const shape = this.transitAccess.execOnAgency(route['agency_id'], `
                    SELECT shape_pt_lon, shape_pt_lat
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
                    ORDER BY shape_pt_sequence ASC;
                `).map(coordinates => [ coordinates['shape_pt_lon'], coordinates['shape_pt_lat'] ]);
                const feature = new Feature(new LineString(shape));
                feature.set('COLOR', `#${route['route_color']}`);
                feature.set('AGENCY_ID', route['agency_id']);
                feature.set('ROUTE_ID', route['route_id']);
                feature.set('SHORT_NAME', route['route_short_name']);
                feature.set('LONG_NAME', route['route_long_name']);
                this.agencyFeatures[`agency_${route['agency_id']}`].push(feature);
            } catch(e) {
                console.error(`Route threw an error!
Agency: ${route['agency_id']}
Route: ${route['route_id']}`, e.toString());
            }
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
            padding: [50, 50, 50, 50]
        });
    }

    goToLine(agency_id, route_id) {
        this.map.getView().fit(this.agencyFeatures[`agency_${agency_id}`].find(feature => feature.get('ROUTE_ID') === route_id).getGeometry().getExtent(), {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50]
        });
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
        Object.values(this.layers).flat().forEach(layer => layer.setVisible(false));
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
        const agencies = this.transitAccess.execOnAll('SELECT * FROM agency').sort((a, b) => a['agency_name'].localeCompare(b['agency_name'])).concat(['all']);
        const routes = this.transitAccess.execOnAll('SELECT * FROM routes')

        agencies.forEach((agency, i) => {
            if (agency === 'all') {
                select(agencyList.nodes()[1])
                    .append('li')
                    .append('p')
                    .style('cursor', 'default')
                    .text('All Agencies')
                    .on('mouseenter', () => Object.values(this.layers).forEach(layer => layer.setVisible(true)))
                    .on('mouseleave', () => Object.values(this.layers).forEach(layer => layer.setVisible(false)));
                return;
            }
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
                    const newRoutes = routes.filter(route => route['agency_id'] === agency['agency_id']).sort((a, b) => a['route_short_name'].localeCompare(b['route_short_name'])).concat(['all']);
                    const features = this.agencyFeatures[`agency_${agency['agency_id']}`].filter(feature => feature.get('AGENCY_ID') === agency['agency_id']);
                    newRoutes.forEach((route, i) => {
                        if (route === 'all') {
                            const styles = Object.values(this.agencyFeatures).flat().map(feature => {
                                const color = feature.get('COLOR').length === 7 ? feature.get('COLOR') : 'rgba(255, 255, 255, 0.7)';
                                    return new Style({
                                        stroke: new Stroke({
                                            width: 2,
                                            color
                                        })
                                    });
                            });
                            select(agencyList.nodes()[1])
                                .append('li')
                                .append('p')
                                .style('cursor', 'default')
                                .text('All Routes')
                                .on('mouseenter', () => Object.values(this.agencyFeatures).flat().forEach((feature, i) => feature.setStyle(styles[i])))
                                .on('mouseleave', () => Object.values(this.agencyFeatures).flat().forEach(feature => feature.setStyle(new Style(null))));
                            return;
                        }
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
                            .on('mouseleave', () => feature.setStyle(new Style(null)))
                            .on('click', () => {
                                this.goToLine(route['agency_id'], route['route_id']);
                                this.clearAgencyList();
                            });
                    });
                });
        });
    }
}