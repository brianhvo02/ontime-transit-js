import TransitMap from './scripts/transitMap';
import { loading, error, welcome, agencyList, feedProgress, locationToggle, reloadButton } from './scripts/selectors';
import { fadeInMain, fadeInWelcome, getLocation } from './scripts/domManip';
import Style from 'ol/style/Style';
import TransitWorker from './scripts/transitWorker';
import { select } from 'd3';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getCenter } from 'ol/extent';
import Stroke from 'ol/style/Stroke';

(async () => {
    try {
        

        const dateLastChecked = parseInt(localStorage.getItem('dateLastChecked'));
        const checkUpdate = dateLastChecked ? (new Date(dateLastChecked + 86400000) < new Date()) : true;
    
        const version = localStorage.getItem('dbVersion');
        const dbVersion = version ? version : 0;

        const worker = new TransitWorker(checkUpdate, dbVersion);

        const mapInstance = new TransitMap(worker);

        mapInstance.map.on('click', e => {
            const features = mapInstance.map.getFeaturesAtPixel(e.pixel);
            if (features.length > 0) {
                const str = features.map(feature => feature.get('STOP_NAME') ? `${feature.get('AGENCY_ID')}: ${feature.get('STOP_NAME')}` : `${feature.get('AGENCY_ID')}: ${feature.get('SHORT_NAME')} (${feature.get('LONG_NAME')})`).join('\n');
                alert(str);
            }
        });

        worker.addEventListener('dbLoaded', async () => {
            
            document.querySelector('.fa-train-subway').addEventListener('click', mapInstance.resetMap.bind(mapInstance));
            
            

            // console.log(mapInstance.layers.forEach(layer => layer.setVisible(false)));

            // agencies.forEach(agency => {
            //     select(`.agency_${agency['agency_id']}`).style('opacity', 0)
            // });

            // const stops = await worker.getAll('stops');
            // const stopFeatures = stops.map(stop => {
            //     const feature = TransitMap.featureWrap(TransitMap.pointWrap([stop['stop_lon'], stop['stop_lat']]));
            //     feature.set('AGENCY_ID', stop['agency_id']);
            //     feature.set('STOP_NAME', stop['stop_name']);
            //     return feature;
            // });

            // const stopFeatures = [TransitMap.featureWrap(TransitMap.pointWrap([-121.86594256256916, 37.415068337720534]))]
            
            // console.log('Drawing features.');
            // mapInstance.drawFeatures(features.concat(stopFeatures));
            await mapInstance.drawMap();
            await mapInstance.createAgencyElements();

            // worker.getWhere('routes', 'agency_id', 'BA').then(routes => console.log(routes));
            // worker.getWhereFirst('routes', 'agency_id', 'BA').then(route => console.log(route));
            reloadButton.on('click', () => {
                const dateLastChecked = parseInt(localStorage.getItem('dateLastChecked')) - 86500000;
                localStorage.setItem('dateLastChecked', dateLastChecked);
                location.reload();
            });

            // mapInstance.map.getView().setCenter(getCenter(agencyFeatures['agency_BA'][0].getGeometry().getExtent()))
            // mapInstance.map.getView().setZoom(14)
            // console.log()
            // console.log(mapInstance.map.getSize())

            if (dbVersion > 0) {
                fadeInMain();
            } else {
                fadeInWelcome();
            }
        });

        worker.addEventListener('updateProgress', () => {
            if (worker.feedProgress === 'Feed downloaded.') {
                reloadButton.attr('disabled', false);
            } else {
                reloadButton.attr('disabled', true);
            }
            feedProgress.text(worker.feedProgress);
        });
        
        // const stops = [];
        // await access.table('stops').each(obj => stops.push([obj['stop_lon'], obj['stop_lat']]))
        // mapInstance.drawFeatures(TransitMap.featuresWrap(stops));

        // await mapInstance.goToLocation();

        // const trip = await access.table('trips').get('BA_1370934');
        // const route = await access.table('routes').where('route_id').equals(trip['route_id']).first();
        // const points = [];
        // await access.table('shapes')
        //     .where('shape_id')
        //     .equals(trip['shape_id'])
        //     .each(seq => {
        //         points.push([seq['shape_pt_lon'], seq['shape_pt_lat']]);
        //     });
        // mapInstance.drawFeatures([TransitMap.featureWrap(TransitMap.lineStringWrap(points), new Style({ 'stroke-color': `#${route['route_color']}` }))]);

        


        // await access.table('routes').where('agency_id').equals('MA').each(async route => {
        //     const trip = trips.find(trip => trip['route_id'] === route['route_id']);
        //     console.log(shapes.filter(shape => shape['shape_id'] === trip['shape_id']).sort((a, b) => a['shape_pt_sequence'] - b['shape_pt_sequence']))
        //     const points = shapes.filter(shape => shape['shape_id'] === trip['shape_id']).sort((a, b) => a['shape_pt_sequence'] - b['shape_pt_sequence']).map(seq => [seq['shape_pt_lon'], seq['shape_pt_lat']]);
        //     // await access.table('shapes').where('shape_id').equals(trip['shape_id']).each(seq => points.push([seq['shape_pt_lon'], seq['shape_pt_lat']]));
        //     features.push(TransitMap.featureWrap(TransitMap.lineStringWrap(points), new Style({ 'stroke-color': `#${route['route_color']}` })));
        // });
        
        // mapInstance.drawFeatures(features);
    } catch (e) {
        console.log(e)
        loading.style('opacity', 0);
        error.style('opacity', 1);
    }
})();



