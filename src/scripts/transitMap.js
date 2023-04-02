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

export default class TransitMap {
    constructor() {
        useGeographic();

        const stroke = new Stroke({
            color: 'rgba(255, 255, 255, 0.7)',
            width: 2,
        });

        const fill = new Fill({
            color: 'rgba(255, 255, 255, 0.7)',
            width: 2,
        });

        const circle = new Circle({
            radius: 8,
            fill,
            stroke
        });

        this.style = new Style({
            stroke,
            fill
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
}