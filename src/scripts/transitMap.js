import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fadeIn, fadeInList, fadeInMain, fadeInWelcome, fadeOut, fadeOutList, getLocation } from './domManip';
import Circle from 'ol/style/Circle';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { backButton, banner, list, loading, main, map, showButton } from './selectors';
import { select } from 'd3-selection';
import Timer from './timer';
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import localforage from 'localforage';
import { containsXY, createEmpty, extend } from 'ol/extent';
import Icon from 'ol/style/Icon';
import GeoJSON from 'ol/format/GeoJSON';

export default class TransitMap {
    layersRT = {};
    featuresRT = {};
    loaded = false;
    currentSelection = {
        agencyId: null,
        routeId: null,
        stopId: null
    }
    currentState = 'agencies';

    constructor(access) {
        useGeographic();

        this.transitAccess = access;
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
                    color: 'rgba(211, 211, 211, 0.8)', 
                    width: 2
                })
            })
        });

        this.agencyMap = Object.fromEntries(this.transitAccess.execOnAll(`
            SELECT agency_id, agency_name
            FROM agency
        `).map(({agency_id, agency_name}) => [agency_id, agency_name]));

        document.querySelector('.fa-pause').addEventListener('click', () => {
            if (this.alertsPaused) {
                this.animateBanner();
                this.alertsPaused = false;
            } else {
                cancelAnimationFrame(this.animation);
                this.alertsPaused = true;
            }
        });
        document.querySelector('.fa-circle-arrow-left').addEventListener('click', this.handleBack.bind(this));
        document.querySelector('.fa-train-subway').addEventListener('click', this.createAgencyElements.bind(this));
        document.querySelector('.fa-location-dot').addEventListener('click', this.goToCurrentLocation.bind(this));
        document.querySelector('.fa-map-location-dot').addEventListener('click', () => {
            fadeOut(main);
            fadeOutList();
            fadeIn(showButton);
        });
        document.querySelector('.fa-eye').addEventListener('click', () => {
            fadeIn(main);
            fadeOut(showButton);
            fadeInList();
        });

        this.instance = this.initialize();
    }

    async initialize() {
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

        this.layers = Object.fromEntries(
            await Promise.all(
                this.transitAccess.agencies.map(async agency => {
                    try {
                        const geojson = await fetch(`https:/ontime-feeds.brianhuyvo.com/geojson/${agency['Id']}/${agency['Id']}.geojson`).then(res => res.json());
                        return [agency['Id'], new VectorLayer({
                            className: 'agency_' + agency['Id'],
                            source: new VectorSource({
                                features: new GeoJSON().readFeatures(geojson).map(feature => {
                                    feature.setStyle(
                                        feature.getGeometry().getType() === 'LineString' ? new Style(
                                            {
                                                stroke: new Stroke({
                                                    color: feature.get('route_color') && feature.get('route_color').length === 7 ? feature.get('route_color') : 'rgba(255, 255, 255, 0.8)',
                                                    width: 2
                                                }),
                                                fill: new Fill({
                                                    color: feature.get('route_color') && feature.get('route_color').length === 7 ? feature.get('route_color') : 'rgba(255, 255, 255, 0.8)',
                                                    width: 2
                                                })
                                            }
                                        ) : new Style(null)
                                    );
                                    return feature;
                                })
                            })
                        })];
                    } catch (e) {
                        console.error(e);
                        return null;
                    }
                })
            )
        );

        this.map = new Map({
            target: 'map',
            loadTilesWhileAnimating: true,
            layers: [
                tile,
                ...this.getLayers()
            ],
            view: new View({
                center: [-122.2711639, 37.9743514],
                zoom: 9.5,
            }),
            controls: []
        });

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

        this.map.on("click", e => {
            const features = this.map.getFeaturesAtPixel(e.pixel);
            if (features.length === 0) {
                if (this.currentState === 'agencies') {
                    this.animateTopLayer();
                } else {
                    const { agencyId, routeId, stopId } = this.currentSelection;
                    if (this.currentState === 'routes') {
                        this.goToFeature(this.getAgency(agencyId).agencyLayer.getSource().getExtent())
                    } else {
                        if (this.currentState === 'stopTimes') {
                            this.goToFeature(this.distanceRange(this.getStop(agencyId, routeId, stopId).getGeometry().getExtent()));
                        } else {
                            this.goToFeature(this.getRoute(agencyId, routeId).routeExtent);
                        }
                    }
                }
                return;
            };

            this.currentState = 'mapClick';
            this.clearList();
            
            features.forEach(feature => {
                const agencyId = feature.get('agency_id');
                const agencyName = this.agencyMap[agencyId];
                const routeId = feature.get('route_id');
                const tripId = feature.get('trip_id');
                const stopId = feature.get('stop_id');
                const stopName = feature.get('stop_name');
                const routeShortName = feature.get('route_short_name');
                const routeLongName = feature.get('route_long_name');
                // console.log(agencyId, agencyName, routeId, tripId, stopId, stopName, routeShortName, routeLongName)

                if (feature.getGeometry().getType() === 'Point') {
                    if (tripId) {
                        select(list.nodes()[1])
                            .append('li')
                            .append('p')
                            .style('cursor', 'pointer')
                            .html(`${agencyName}<br>Going to ${stopName}<br>${routeShortName} (${routeLongName})`)
                            .on('click', () => {
                                this.getFeatures().forEach(feature => feature.get('route_id') === routeId || feature.setStyle(new Style(null)));
                                this.currentSelection = { agencyId, routeId, stopId };
                                this.createStopTimeElements();
                            })
                    } else {
                        this.currentSelection = { agencyId, routeId, stopId };
                        select(list.nodes()[1])
                            .append('li')
                            .append('p')
                            .style('cursor', 'pointer')
                            .html(`${agencyName}<br>${stopName}<br>${routeShortName} (${routeLongName})`)
                            .on('click', () => {
                                this.getFeatures().forEach(feature => feature.get('route_id') === routeId || feature.setStyle(new Style(null)));
                                this.currentSelection = { agencyId, routeId, stopId };
                                this.createStopTimeElements();
                            })
                    }
                } else {
                    this.currentSelection = { agencyId, routeId, stopId };
                    select(list.nodes()[0])
                        .append('li')
                        .append('p')
                        .style('cursor', 'pointer')
                        .html(`${agencyName}<br>${routeShortName} (${routeLongName})`)
                        .on('click', () => {
                            this.getFeatures().forEach(feature => feature.get('route_id') === routeId || feature.setStyle(new Style(null)));
                            this.createStopElements(agencyId, routeId);
                        })
                }
            })
        });
        window.getFeatures = this.getFeatures.bind(this);
        return this;
    }

    getLayers() {
        return Object.values(this.layers);
    }

    getAgencies() {
        return this.transitAccess.execOnAll(`
            SELECT *
            FROM agency
        `)
        .sort((a, b) => a['agency_name'].localeCompare(b['agency_name']))
        .map(agency => { 
            return { 
                agencyLayer: this.layers[agency['agency_id']], 
                ...agency
            }
        });
    }

    getAgency(agencyId) {
        const agency = this.transitAccess.execOnAll(`
            SELECT *
            FROM agency
            WHERE agency_id = "${agencyId}"
        `)[0];
        return { 
            agencyLayer: this.layers[agencyId], 
            ...agency
        }
    }

    getFeatures(agencyId) {
        return agencyId ? this.layers[agencyId].getSource().getFeatures() : Object.values(this.layers).map(layer => layer.getSource().getFeatures()).flat();
    }

    getRoutes(agencyId) {
        const features = this.getFeatures(agencyId);
        const routeMap = {};
        const routes = this.transitAccess.execOnAgency(agencyId, `
            SELECT *
            FROM routes
            ORDER BY route_id
        `);
        routes.forEach((route, i) => {
            route.routeFeatures = [];
            route.stopFeatures = [];
            route.routeExtent = createEmpty();
            routeMap[route['route_id']] = i;
        });

        features.forEach(feature => {
            const routeId = feature.get('route_id');
            if (routeId) {
                extend(routes[routeMap[routeId]].routeExtent, feature.getGeometry().getExtent())
                routes[routeMap[routeId]].routeFeatures.push(feature);
            } else {
                const featureRoutes = feature.get('routes');
                featureRoutes.forEach(route => routes[routeMap[route['route_id']]].stopFeatures.push(feature));
            }
        });

        return {
            routeMap,
            routes
        };
    }

    getRoute(agencyId, routeId) {
        const features = this.getFeatures(agencyId);
        const route = this.transitAccess.execOnAgency(agencyId, `
            SELECT *
            FROM routes
            WHERE route_id = "${routeId}"
            ORDER BY route_id
        `)[0];
        route.routeFeatures = [];
        route.stopFeatures = [];
        route.routeExtent = createEmpty();

        features.forEach(feature => {
            const featureRouteId = feature.get('route_id');
            if (featureRouteId && featureRouteId === routeId) {
                extend(route.routeExtent, feature.getGeometry().getExtent())
                route.routeFeatures.push(feature);
            } else if (!featureRouteId) {
                const featureRoutes = feature.get('routes');
                featureRoutes.forEach(featureRoute => featureRoute['route_id'] !== routeId || route.stopFeatures.push(feature));
            }
        });

        return route;
    }

    getStops(agencyId, routeId) {
        return this.getFeatures().filter(feature => 
            feature.getGeometry().getType() === 'Point' 
                && feature.get('agency_name') === this.agencyMap[agencyId]
                && feature.get('routes').find(route => route['route_id'] === routeId) 
        );
    }

    getStop(agencyId, routeId, stopId) {
        return this.getFeatures().find(feature => 
            feature.getGeometry().getType() === 'Point' 
                && feature.get('agency_name') === this.agencyMap[agencyId]
                && feature.get('routes').find(route => route['route_id'] === routeId) 
                && feature.get('stop_id') === stopId
        );
    }

    distanceRange(coord, dist = 1) {
        const [lon, lat] = coord;
        const latDist = dist / 69;
        const lonDist = dist / (Math.cos(lat * Math.PI / 180) * 69.172);
        return [lon - lonDist, lat - latDist, lon + lonDist, lat + latDist];
    }

    setLayerVisible(agency_id, bool) {
        this.layers[agency_id].setVisible(bool);
    }

    goToFeature(extent) {
        this.map.getView().fit(extent, {
            size: this.map.getSize(),
            padding: [50, 50, 50, 50],
            duration: 1000
        });
    }

    animateTopLayer() {
        this.map.getView().animate({
            center: [-122.2711639, 37.9743514],
            zoom: 9.5,
            duration: 1000
        });
    }

    async getBuffer(key, endpoint) {
        let buffer = await localforage.getItem(key);
        let timestamp = await localforage.getItem(`${key}_timestamp`);
        if (!(buffer && timestamp && timestamp + 300000 > new Date().getTime())) {
            buffer = await fetch(`https://api.511.org/transit/${endpoint}?api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7${key === 'service_alerts' ? '' : `&agency=${key.slice(0, key.indexOf('_'))}`}`).then(res => res.arrayBuffer());
            await localforage.setItem(key, buffer);
            timestamp = new Date().getTime();
            await localforage.setItem(`${key}_timestamp`, timestamp);
        }

        return buffer;
    }

    async getRTPos(agencyId) {
        if (this.layersRT && this.layersRT[agencyId]) this.layersRT[agencyId].dispose();

        const buffer = await this.getBuffer(`${agencyId}_realtime_positions`, 'vehiclepositions');
        const stopRTPositions = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)).entity;
        const features = stopRTPositions.map(stopRTPosition => {
            const { longitude, latitude, speed, bearing } = stopRTPosition.vehicle.position;
            const stopId = stopRTPosition.vehicle.stopId;
            const feature = new Feature(new Point([longitude, latitude]));
            
            feature.setStyle(new Style({
                image: bearing ? new Icon({
                    src: 'assets/arrow.png',
                    color: stopRTPosition.vehicle.trip ? `rgba(50, 205, 50, 0.8)` : `rgba(200, 8, 21, 0.8)`,
                    scale: 0.01,
                    rotation: bearing * Math.PI / 180
                }) : new Circle({
                    radius: 2,
                    fill: new Fill({
                        color: stopRTPosition.vehicle.trip ? `rgba(50, 205, 50, 0.8)` : `rgba(200, 8, 21, 0.8)`
                    }),
                    stroke: new Stroke({
                        color: stopRTPosition.vehicle.trip ? `rgba(50, 205, 50, 0.8)` : `rgba(200, 8, 21, 0.8)`,
                        width: 2
                    })
                })
            }));

            feature.set('agency_id', agencyId);
            feature.set('bearing', bearing);
            if (stopId) {
                feature.set('stop_id', stopId);
                feature.set('stop_name', this.transitAccess.execOnAgency(agencyId, `SELECT stop_name FROM stops WHERE stop_id = "${stopId}"`)[0]['stop_name']);
            }
            feature.set('vehicle_color', stopRTPosition.vehicle.trip ? `rgba(50, 205, 50, 0.8)` : `rgba(200, 8, 21, 0.8)`);
            feature.set('vehicle_speed', speed);

            if (stopRTPosition.vehicle.trip) {
                const { tripId, routeId } = stopRTPosition.vehicle.trip;
                feature.set('trip_id', tripId);
                const { route_short_name, route_long_name } = this.transitAccess.execOnAgency(agencyId, `SELECT route_short_name, route_long_name FROM routes WHERE route_id = "${routeId}"`)[0];
                feature.set('route_short_name', route_short_name);
                feature.set('route_long_name', route_long_name);
                feature.set('route_id', routeId);
            }

            return feature;
        });

        const layerRT = new VectorLayer({
            source: new VectorSource({
                features
            })
        });

        this.layersRT[agencyId] = layerRT;
        this.featuresRT[agencyId] = features;
        this.map.addLayer(layerRT);
    }

    async getServiceAlerts() {
        const buffer = await this.getBuffer('service_alerts', 'servicealerts');
        const serviceAlerts = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)).entity;
        const alerts = serviceAlerts.map(({alert}) => 
            `${this.agencyMap[alert.informedEntity[0].agencyId] || alert.informedEntity[0].agencyId}: ${alert.headerText.translation[0].text
                .replace(/\s+/g, ' ')}${alert.descriptionText ? ' - ' : ''}${alert.descriptionText.translation[0].text.replace(/\s+/g, ' ')}`
            ).join('\t\t');

        const canvas = document.querySelector('.banner');
        canvas.width = innerWidth;
        canvas.height = 25;
        const ctx = canvas.getContext('2d');
        let currentWidth = innerWidth;

        this.animateBanner = () => {
            this.animation = requestAnimationFrame(this.animateBanner);
            const blankCanvas = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB9IAAAAyCAYAAAAA5pBDAAAAAXNSR0IArs4c6QAAB1ZJREFUeF7t2zERADEMA8GEP+l0/1cIwhrCznUa3+MIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBT+CyIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBH4BQ7oaCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBABAzpciBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAoZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgS3gI10ZBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAoZ0ORAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAUO6BggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAwBbwka4MAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECAQAUO6HAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgCFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAYAv4SFcGAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBCIgCFdDgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAwJCuAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgsAV8pCuDAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAhEwJAuBwIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEjXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQ2AI+0pVBgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQiYEiXAwECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQMKRrgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIbAEf6cogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIRMKTLgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNI1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEtoCPdGUQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEIGNLlQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEDOkaIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECW8BHujIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgEAEDOlyIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAEChnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBLeAjXRkECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCAChnQ5ECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABQ7oGCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIDAFvCRrgwCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIBABQ7ocCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAIV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEBgC/hIVwYBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEIiAIV0OBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEDAkK4BAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECCwBXykK4MAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECETAkC4HAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgSNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBDYAj7SlUGAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBCJgSJcDAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAwpGuAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAhsAR/pyiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAhEwpMuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0jVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgS2gI90ZRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQgY0uVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQM6RogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJb4AH2RAAz8oAOxAAAAABJRU5ErkJggg=='
            canvas.width = innerWidth;
            ctx.font = "15px Roboto";
            ctx.fillStyle = '#F0F4F8';
            currentWidth -= 3;
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillText(alerts, currentWidth, 17);
            if (canvas.toDataURL() === blankCanvas) {
                currentWidth = innerWidth;
            }
        }
        
        this.animateBanner();
    }

    resetMap(currentLocation) {
        this.getFeatures().forEach(feature => {
            feature.setStyle(
                new Style({
                    stroke: new Stroke({
                        color: feature.get('route_color') || this.style.getStroke().getColor(),
                        width: 2
                    })
                })
            )
        });

        this.getLayers().forEach(layer => layer.setVisible(true));
        Object.values(this.layersRT).flat().forEach(layer => layer.setVisible(false));

        if (!currentLocation) this.animateTopLayer();
    }

    clearList() {
        list.nodes().forEach(el => Array.from(el.children).forEach(child => child.remove()));
    }

    handleBack() {
        switch (this.currentState) {
            case 'routes':
            case 'currentLocationStops':
            case 'mapClick':
                this.createAgencyElements();
                break;
            case 'stops':
                this.createRouteElements();
                break;
            case 'stopTimes':
                this.createStopElements();
                break;
        }
    }

    async goToCurrentLocation() {
        this.resetMap(true);
        fadeIn(loading, true);

        if (!this.coords) {
            const { coords } = await getLocation();
            this.coords = coords;
        }

        let value = 1;
        this.currentPositionExtent = this.distanceRange([this.coords.longitude, this.coords.latitude])
        let features = this.getFeatures().filter(feature => containsXY(this.currentPositionExtent, ...feature.getGeometry().getCoordinates()));

        while (features.length > 60) {
            value -= 0.1;
            this.currentPositionExtent = this.distanceRange([this.coords.longitude, this.coords.latitude], value);
            features = this.getFeatures().filter(feature => containsXY(this.currentPositionExtent, ...feature.getGeometry().getCoordinates()));
        }
        
        this.goToFeature(this.currentPositionExtent);

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

        features.forEach(feature => feature.getGeometry().getType() === 'Point' ? feature.setStyle(this.style) : feature.setStyle(new Style({
            stroke: new Stroke({
                color: feature.get('COLOR'),
                width: 2
            })
        })));
        this.createCurrentLocationStopElements(features);
    }

    createAgencyElements() {
        this.currentState = 'agencies';
        this.clearList();
        this.resetMap();
        fadeOut(backButton);
        const agencies = this.getAgencies();
        const layers = this.getLayers();
        agencies.forEach(({
            agency_id: agencyId, 
            agency_name: agencyName, 
            agencyLayer
        }, i) => {
            select(list.nodes()[Math.floor(i / (agencies.length / 2))])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(agencyName)
                .on('mouseenter', () => {
                    layers.forEach(layer => layer.setVisible(layer === agencyLayer ? true : false));
                })
                .on('mouseleave', () => {
                    layers.forEach(layer => layer.setVisible(true));
                })
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToFeature(agencyLayer.getSource().getExtent());
                })
                .on('click', () => {
                    this.getRTPos(agencyId);
                    this.currentSelection = { agencyId, routeId: null, stopId: null };
                    this.createRouteElements();
                });
        });
    }

    createRouteElements() {
        this.currentState = 'routes';
        this.clearList();
        const { agencyId } = this.currentSelection;
        const agency = this.getAgency(agencyId);
        this.goToFeature(agency.agencyLayer.getSource().getExtent());
        fadeIn(backButton);
        const { routeMap, routes } = this.getRoutes(agencyId);
        routes.forEach(({ 
            route_id: routeId, 
            route_short_name: routeShortName, 
            route_long_name: routeLongName, 
            route_color: routeColor,
            routeFeatures,
            stopFeatures,
            routeExtent
        }, i) => {
            stopFeatures.forEach(feature => feature.setStyle(new Style(null)));
            
            select(list.nodes()[routes.length > 30 ? Math.floor(i / (routes.length / 2)) : 0])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .html(`${routeShortName}<br>${routeLongName}`)
                .on('mouseenter', () => {
                    routes.forEach(({routeFeatures}) => routeFeatures.forEach(feature => feature.get('route_id') === routeId ? feature.setStyle(
                        new Style({ 
                            stroke: new Stroke({
                                color: `#${routeColor}`,
                                width: 2
                            }),
                            fill: new Fill({
                                color: `#${routeColor}`,
                                width: 2
                            })
                        })
                    ) : feature.setStyle(new Style(null))));
                    stopFeatures.forEach(feature => feature.setStyle(feature.setStyle(this.style)));
                })
                .on('mouseleave', () => {
                    stopFeatures.forEach(feature => feature.setStyle(new Style(null)));
                    routes.forEach(({routeFeatures}) => routeFeatures.forEach(feature => 
                        feature.setStyle(
                            new Style({ 
                                stroke: new Stroke({
                                    color: feature.get('route_color'),
                                    width: 2
                                }),
                                fill: new Fill({
                                    color: feature.get('route_color'),
                                    width: 2
                                })
                            })
                        )
                    ));
                })
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToFeature(routeExtent);
                })
                .on('click', () => {
                    this.currentSelection = { agencyId, routeId, stopId: null };
                    this.createStopElements(routeExtent);
                })
        });
    }

    createStopElements(routeExtent) {
        this.currentState = 'stops';
        fadeIn(backButton);
        this.clearList();
        const { agencyId, routeId } = this.currentSelection;
        this.goToFeature(routeExtent);
        const stops = this.getStops(agencyId, routeId);
        stops.forEach(feature => feature.setStyle(new Style(null)));
        stops.concat('all').forEach((stop, i) => {
            if (stop === 'all') {
                let flag = true;
                select(list.nodes()[1])
                    .append('li')
                    .append('p')
                    .style('cursor', 'default')
                    .text('All Stops')
                    .on('mouseenter', () => stops.slice(0, -1).forEach(stop => stop.feature.setStyle(this.style)))
                    .on('mouseleave', () => stops.slice(0, -1).forEach(stop => !flag || stop.feature.setStyle(new Style(null))))
                    .on('click', () => flag = !flag)
                return;
            }
            const stopId = stop.get('stop_id')
            const stopName = stop.get('stop_name')
            select(list.nodes()[stops.length > 30 ? Math.floor(i / (stops.length / 2)) : 0])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .text(stopName)
                .on('mouseenter', () => stop.setStyle(this.style))
                .on('mouseleave', () => stop.setStyle(new Style(null)))
                .on('contextmenu', e => {
                    e.preventDefault();
                    this.goToFeature(this.distanceRange(stop.getGeometry().getCoordinates()));
                })
                .on('click', () => {
                    this.currentSelection = { agencyId, routeId, stopId }
                    this.createStopTimeElements()
                })
        });
    }

    createCurrentLocationStopElements(features) {
        this.currentState = 'currentLocationStops';
        fadeIn(backButton);
        this.clearList();

        features.sort((a, b) => {
            const agencyComp = a.get('agency_name').localeCompare(b.get('agency_name'));
            if (agencyComp !== 0) return agencyComp;
            return a.get('stop_name').localeCompare(b.get('stop_name'));
        }).forEach((feature, i) => {
            const agencyName = feature.get('agency_name');
            const agencyId = Object.entries(this.agencyMap).find(([_, possibleAgencyName]) => possibleAgencyName === agencyName)[0];
            const stopId = feature.get('stop_id');
            const stopName = feature.get('stop_name');
            const routeId = feature.get('route_id');
            const routeShortName = feature.get('route_short_name');
            const routeLongName = feature.get('route_long_name');

            select(list.nodes()[features.length > 30 ? Math.floor(i / (features.length / 2)) : 0])
                .append('li')
                .append('p')
                .style('cursor', 'pointer')
                .html(`${agencyName}<br>${stopName}`)
                // .on('mouseenter', () => this.goToStop(agencyId, stopId))
                // .on('mouseleave', () => {
                //     this.map.getView().fit(this.currentPositionExtent, {
                //         size: this.map.getSize(),
                //         padding: [50, 50, 50, 50],
                //         duration: 1000
                //     });
                // })
                .on('click', () => {
                    features.forEach(feature => feature.get('stop_id') !== stopId ? feature.setStyle(new Style(null)) : null);
                    this.currentSelection = { agencyId, stopId, routeId: null }
                    this.createStopTimeElements()
                })
        });
    }

    async createStopTimeElements() {
        this.currentState = 'stopTimes';
        const { agencyId, routeId, stopId } = this.currentSelection;
        const stopFeature = this.getStop(agencyId, routeId, stopId);
        stopFeature.setStyle(this.style);
        const { routes } = this.getRoutes(agencyId);
        const currentRoute = this.getRoute(agencyId, routeId);
        routes.forEach(route => {
            route.routeFeatures.forEach(feature =>
                feature.setStyle(
                    new Style({
                        stroke: new Stroke({
                            color: feature.get('route_color'),
                            width: 2
                        })
                    })
                )
            );
        });
        
        const routeShortName = currentRoute['route_short_name'];
        this.goToFeature(this.distanceRange(stopFeature.getGeometry().getCoordinates()));
        this.clearList();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        const createElements = async (ignoreOtherRoutes, startTomorrow) => {
            this.clearList();
            fadeIn(loading, true);

            // const date = new Date('2023-04-04 11:45:00 PM');
            const date = new Date();
            const stopRealTimesBuf = await this.getBuffer(`${agencyId}_realtime_timestamp`, 'tripupdates');
            const startTomorrow1 = (date.getMonth() === 1 && date.getDate() === 28) || ([0, 2, 4, 6, 7, 9, 11].includes(date.getMonth()) && date.getDate() === 31) || ([3, 5, 8, 10].includes(date.getMonth()) && date.getDate() === 30);
            const stopTimesFiltered = this.transitAccess.execOnAgency(agencyId, `
                SELECT time(stop_times.departure_timestamp, 'unixepoch') departure_time, trip_headsign, stop_headsign, trips.trip_id, routes.route_id, routes.route_short_name
                FROM stop_times 
                JOIN trips ON trips.trip_id = stop_times.trip_id
                JOIN stops ON stops.stop_id = stop_times.stop_id
                JOIN routes ON routes.route_id = trips.route_id
                LEFT OUTER JOIN calendar ON trips.service_id = calendar.service_id
                WHERE stops.stop_id = "${stopId}"
                    AND routes.route_id = "${routeId}"
                    AND stop_times.departure_timestamp >= ${startTomorrow ? 0 : date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()}
                    AND (
                        trips.service_id IN (
                            SELECT service_id
                            FROM calendar_dates 
                            WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + (startTomorrow ? startTomorrow1 ? 1 : date.getDate() + 1 : date.getDate())}"
                                AND exception_type = 1
                        )
                        OR (
                            trips.service_id NOT IN (
                                SELECT service_id
                                FROM calendar_dates 
                                WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + (startTomorrow ? startTomorrow1 ? 1 : date.getDate() + 1 : date.getDate())}"
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
                    AND stop_times.departure_timestamp >= ${startTomorrow ? 0 : date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()}
                    AND (
                        trips.service_id IN (
                            SELECT service_id
                            FROM calendar_dates 
                            WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + (startTomorrow ? startTomorrow1 ? 1 : date.getDate() + 1 : date.getDate())}"
                                AND exception_type = 1
                        )
                        OR (
                            trips.service_id NOT IN (
                                SELECT service_id
                                FROM calendar_dates 
                                WHERE date = "${date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + (startTomorrow ? startTomorrow1 ? 1 : date.getDate() + 1 : date.getDate())}"
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

            const tripInfo = rightColumn
                .append('li')
                            
            if ((ignoreOtherRoutes ? stopTimesFiltered : stopTimes).length === 0) {
                select(list.nodes()[0])
                    .append('li')
                    .append('p')
                    .text('No times available until tomorrow morning. Check tomorrow\'s schedule?')
                    .on('click', () => createElements(ignoreOtherRoutes, true))
                    .node().dataset['stopTimeData'] = [agencyId, routeId, stopId].join(',');
            }
            (ignoreOtherRoutes ? stopTimesFiltered : stopTimes).forEach((stopTime, i) => {
                const {
                    departure_time: departureTime,
                    trip_headsign: tripHeadsign,
                    stop_headsign: stopHeadsign,
                    trip_id: tripId,
                    route_short_name: routeShortName,
                    route_id: tripRouteId
                } = stopTime;

                if (ignoreOtherRoutes && i === 0) routes.forEach(({ routeFeatures }) => routeFeatures.forEach(feature => feature.get('route_id') === routeId || feature.setStyle(new Style(null))));

                if (!ignoreOtherRoutes) {
                    currentRoute.routeFeatures.forEach(feature => 
                        feature.setStyle(
                            new Style({
                                stroke: new Stroke({
                                    color: feature.get('route_color'),
                                    width: 2
                                })
                            })
                        )
                    );
                }

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
                    .style('cursor', 'pointer')
                    .html(`${time.toLocaleTimeString('en-US')}, in ${timeElapsedHours === 0 ? '' : `${timeElapsedHours} hrs, `}${timeElapsedMinutes < 0 ? 60 + timeElapsedMinutes : timeElapsedMinutes} mins${ignoreOtherRoutes ? '' : `<br>${routeShortName} (${stopHeadsign ? stopHeadsign : tripHeadsign})`}`)
                    // .attr('title', routeLongName)
                    .on('click', () => {
                        const feature = this.featuresRT[agencyId].find(feature => feature.get('trip_id') === tripId);
                        if (feature) {
                            this.goToFeature(this.distanceRange(feature.getGeometry().getCoordinates(), 0.5));
                            const bearing = feature.get('bearing');
                            feature.setStyle(new Style({
                                image: bearing ? new Icon({
                                    src: 'assets/arrow.png',
                                    color: '#FFC000',
                                    scale: 0.01,
                                    rotation: bearing * Math.PI / 180
                                }) : new Circle({
                                    radius: 2,
                                    fill: new Fill({
                                        color: '#FFC000'
                                    }),
                                    stroke: new Stroke({
                                        color: '#FFC000',
                                        width: 2
                                    })
                                })
                            }));
                        }

                        Array.from(tripInfo.node().children).forEach(child => child.remove());
                        tripInfo.append('p')
                            .style('display', 'block')
                            .append('strong')
                            .text('TRIP INFO');
                        tripInfo.append('p')
                                .text(`Route Name: ${routeShortName}`)
                        tripInfo.append('p')
                            .text(`Headsign: ${stopHeadsign ? stopHeadsign : tripHeadsign}`)
                        
                        this.currentSelection = { agencyId, routeId, stopId };
                    })
            });

            fadeOut(loading);
        }

        createElements(true);
    }

    
}
