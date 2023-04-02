import TransitMap from './scripts/transitMap';
import { loading, error, welcome, agencyList, feedProgress, locationToggle, reloadButton } from './scripts/selectors';
import { fadeInMain, fadeInWelcome, getLocation } from './scripts/domManip';
import Style from 'ol/style/Style';
import TransitWorker from './scripts/transitWorker';

(async () => {
    try {
        const mapInstance = new TransitMap();

        mapInstance.map.on('click', e => {
            const features = mapInstance.map.getFeaturesAtPixel(e.pixel);
            if (features.length > 0) {
                const str = features.map(feature => `${feature.get('AGENCY_ID')}: ${feature.get('SHORT_NAME')} (${feature.get('LONG_NAME')})`).join('\n');
                alert(str);
            }
        });

        const dateLastChecked = parseInt(localStorage.getItem('dateLastChecked'));
        const checkUpdate = dateLastChecked ? (new Date(dateLastChecked + 86400000) < new Date()) : true;
    
        const version = localStorage.getItem('dbVersion');
        const dbVersion = version ? version : 0;

        const worker = new TransitWorker(checkUpdate, dbVersion);

        worker.addEventListener('dbLoaded', async () => {
            if (dbVersion > 0) {
                fadeInMain();
            } else {
                fadeInWelcome();
            }

            worker.getTable('agency').then(agencies => {
                agencies.forEach(agency => {
                    agencyList.append('li')
                        .append('a')
                        .attr('href', agency['agency_url'])
                        .attr('target', '_blank')
                        .text(agency['agency_name']);
                });
            });
            
            // const agencies = await worker.getTable('agency');
            worker.getTable('routes').then(async routes => {
                const features = [];
                const trips = await worker.getTable('trips');
                const shapes = await worker.getTable('shapes');
                console.log('Loaded all routes, trips, and shapes.');
                routes.forEach(route => {
                    try {
                        const trip = trips.find(trip => trip['agency_id'] === route['agency_id'] && trip['route_id'] === route['route_id']);
                        const points = shapes.filter(shape => shape['agency_id'] === trip['agency_id'] && shape['shape_id'] === trip['shape_id']).sort((a, b) => a['shape_pt_sequence'] - b['shape_pt_sequence']).map(seq => [seq['shape_pt_lon'], seq['shape_pt_lat']]);
                        const feature = TransitMap.featureWrap(TransitMap.lineStringWrap(points), new Style({ 'stroke-color': `#${route['route_color']}` }));
                        feature.set('COLOR', `#${route['route_color']}`);
                        feature.set('AGENCY_ID', route['agency_id']);
                        feature.set('SHORT_NAME', route['route_short_name']);
                        feature.set('LONG_NAME', route['route_long_name']);
                        features.push(feature);
                    } catch(e) {
                        console.error(`Route threw an error!
Agency: ${route['agency_id']}
Route: ${route['route_id']}`, e.toString());
                    }
                   
                });
                console.log('Drawing features.');
                mapInstance.drawFeatures(features);
            });

            reloadButton.on('click', () => {
                const dateLastChecked = parseInt(localStorage.getItem('dateLastChecked')) - 86500000;
                localStorage.setItem('dateLastChecked', dateLastChecked);
                location.reload();
            });
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



