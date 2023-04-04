import { fadeIn, fadeInMain, fadeInWelcome, fadeOut } from "./scripts/domManip";
import { backButton, error, loading } from "./scripts/selectors";
import TransitAccess from "./scripts/transitAccess";
import TransitMap from "./scripts/transitMap";

document.querySelector('.continue').addEventListener('click', fadeInMain);

(async () => {
    try {
        const notFirstLoad = localStorage.getItem('agencies');
        const transitAccess = await new TransitAccess().instance;
        const transitMap = new TransitMap(transitAccess);
        transitMap.drawMap();
        
        let loaded = false;

        transitMap.map.on('rendercomplete', () => {
            if (!loaded) {
                loaded = true;
                notFirstLoad ? fadeInMain(transitMap) : fadeInWelcome();
                fadeOut(backButton);
            }
        });
    } catch (e) {
        console.log(e);
        
        fadeOut(loading);
        fadeIn(error);
    }
})();



