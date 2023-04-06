import { fadeIn, fadeInMain, fadeOut } from './scripts/domManip';
import { error, loading } from './scripts/selectors';
import TransitAccess from './scripts/transitAccess';
import TransitMap from './scripts/transitMap';

document.querySelector('.continue').addEventListener('click', fadeInMain);

(async () => {
    try {
        const transitAccess = await new TransitAccess().instance;
        const transitMap = await new TransitMap(transitAccess).instance;
        await transitMap.getServiceAlerts();
    } catch (e) {
        if (e.toString() === 'Error: both async and sync fetching of the wasm failed') location.reload();
        console.log(e);
        
        fadeOut(loading);
        fadeIn(error, true);
    }
})();



