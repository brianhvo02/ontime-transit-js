import TransitAccess from './scripts/transitAccess';
import TransitMap from './scripts/transitMap';
import _ from './scripts/navbar';
import { loading, error, welcome, agencyList, feedProgress } from './scripts/selectors';
import { fadeInMain } from './scripts/domManip';

const mapInstance = new TransitMap();

(async () => {
    try {
        const worker = new Worker(new URL('./db-worker.js', import.meta.url));
        await new Promise(resolve => {
            worker.onmessage = e => {
                if(!isNaN(e.data)) {
                    feedProgress.text(`Feed ${Math.round(e.data * 100)}% downloaded.`);
                }

                if (e.data === 'completed') resolve();
            }
        });
       
        const access = await new TransitAccess().instance;

        const firstLoad = localStorage.getItem('firstLoad');
        if (firstLoad) {
            fadeInMain();
        } else {
            setTimeout(() => {
                loading.style('opacity', 0);
                welcome.style('opacity', 1);
                localStorage.setItem('firstLoad', true);
            }, 1500);
        }

        const gtfsAgencies = await access.agency.toArray();
        console.log(gtfsAgencies)
        gtfsAgencies.forEach(agency => {
            agencyList.append('li')
                .append('a')
                .attr('href', agency['agency_url'])
                .attr('target', '_blank')
                .text(agency['agency_name']);
        });
    } catch (e) {
        console.log(e)
        loading.style('opacity', 0);
        error.style('opacity', 1);
    }
})();



