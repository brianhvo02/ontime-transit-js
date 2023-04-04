import { fadeInMain, fadeInWelcome, fadeOutMainInMap, handleBars, handleGear } from "./scripts/domManip";
import { error, loading } from "./scripts/selectors";
import TransitAccess from "./scripts/transitAccess";
import TransitMap from "./scripts/transitMap";

document.querySelector('.continue').addEventListener('click', fadeInMain);
document.querySelector('.fa-map-location-dot').addEventListener('click', fadeOutMainInMap);
document.querySelector('.fa-bars').addEventListener('click', handleBars);
document.querySelector('.fa-gear').addEventListener('click', handleGear);

(async () => {
    try {
        const notFirstLoad = localStorage.getItem('agencies');
        const transitAccess = await new TransitAccess().instance;
        const transitMap = new TransitMap(transitAccess);
        transitMap.drawMap();
        document.querySelector('.fa-train-subway').addEventListener('click', transitMap.resetMap.bind(transitMap));
        document.querySelector('.fa-location-dot').addEventListener('click', transitMap.goToCurrentLocation.bind(transitMap));
        
        let loaded = false;

        transitMap.map.on('rendercomplete', () => {
            if (!loaded) {
                loaded = true;
                notFirstLoad ? fadeInMain(transitMap) : fadeInWelcome();
            }
        });
    } catch (e) {
        console.log(e);
        loading.style('opacity', 0);
        error.style('opacity', 1);
    }
})();



