import TransitMap from './scripts/transitMap';
import { loading, error, welcome, agencyList, feedProgress, locationToggle, reloadButton } from './scripts/selectors';
import { fadeInMain, fadeInWelcome, getLocation } from './scripts/domManip';
import Style from 'ol/style/Style';
import TransitWorker from './scripts/transitWorker';
import { select } from 'd3';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

(async () => {
    try {
        const mapInstance = new TransitMap();

        mapInstance.map.on('click', e => {
            const features = mapInstance.map.getFeaturesAtPixel(e.pixel);
            if (features.length > 0) {
                const str = features.map(feature => feature.get('STOP_NAME') ? `${feature.get('AGENCY_ID')}: ${feature.get('STOP_NAME')}` : `${feature.get('AGENCY_ID')}: ${feature.get('SHORT_NAME')} (${feature.get('LONG_NAME')})`).join('\n');
                alert(str);
            }
        });

        const dateLastChecked = parseInt(localStorage.getItem('dateLastChecked'));
        const checkUpdate = dateLastChecked ? (new Date(dateLastChecked + 86400000) < new Date()) : true;
    
        const version = localStorage.getItem('dbVersion');
        const dbVersion = version ? version : 0;

        const worker = new TransitWorker(checkUpdate, dbVersion);

        worker.addEventListener('dbLoaded', async () => {
            const agencies = await worker.getAll('agency');

            agencies.forEach((agency, i) => {
                select(agencyList.nodes()[Math.floor(i / (agencies.length / 2))]).append('li')
                    // .append('a')
                    // .attr('href', agency['agency_url'])
                    // .attr('target', '_blank')
                    .text(agency['agency_name'])
                    .on('mouseenter', () => mapInstance.layers[`agency_${agency['agency_id']}`].setVisible(true))
                    .on('mouseleave', () => mapInstance.layers[`agency_${agency['agency_id']}`].setVisible(false));
                    // .on('click', () => )
            });

            console.log('Starting draw calculations.');
            const agencyFeatures = Object.fromEntries(agencies.map(agency => [`agency_${agency['agency_id']}`, new Array()]));
            const startTime = new Date();
            const routes = await worker.getAll('routes');
            
            for (let i = 0; i < routes.length; i++) {
                const route = routes[i];
                try {
                    const trip = await worker.getWhereFirst('trips', {
                        agency_id: route['agency_id'], 
                        route_id: route['route_id']
                    });
                    const points = await worker.getWhere('shapes', '[shape_id+agency_id]', [trip['shape_id'], trip['agency_id']]);
                    const feature = TransitMap.featureWrap(TransitMap.lineStringWrap(points.sort((a, b) => a['shape_pt_sequence'] - b['shape_pt_sequence']).map(seq => [seq['shape_pt_lon'], seq['shape_pt_lat']])));
                    feature.set('COLOR', `#${route['route_color']}`);
                    feature.set('AGENCY_ID', route['agency_id']);
                    feature.set('SHORT_NAME', route['route_short_name']);
                    feature.set('LONG_NAME', route['route_long_name']);
                    agencyFeatures[`agency_${route['agency_id']}`].push(feature);
                } catch(e) {
                    console.error(`Route threw an error!
Agency: ${route['agency_id']}
Route: ${route['route_id']}`, e.toString());
                }
            }

            mapInstance.createAgencyLayers(agencies)
            Object.entries(agencyFeatures).forEach(mapInstance.addFeatures.bind(mapInstance));

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
            const timeElapsed = new Date(new Date() - startTime);
            console.log(`Finished in ${timeElapsed.getSeconds()} sec, ${timeElapsed.getMilliseconds()} ms`);

            // worker.getWhere('routes', 'agency_id', 'BA').then(routes => console.log(routes));
            // worker.getWhereFirst('routes', 'agency_id', 'BA').then(route => console.log(route));
            reloadButton.on('click', () => {
                const dateLastChecked = parseInt(localStorage.getItem('dateLastChecked')) - 86500000;
                localStorage.setItem('dateLastChecked', dateLastChecked);
                location.reload();
            });

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



