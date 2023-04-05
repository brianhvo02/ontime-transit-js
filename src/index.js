import { fadeIn, fadeInMain, fadeInWelcome, fadeOut } from "./scripts/domManip";
import { backButton, error, loading } from "./scripts/selectors";
import TransitAccess from "./scripts/transitAccess";
import TransitMap from "./scripts/transitMap";

document.querySelector('.continue').addEventListener('click', fadeInMain);

(async () => {
    try {
        const transitAccess = await new TransitAccess().instance;
        const transitMap = new TransitMap(transitAccess);
        transitMap.drawMap();
    } catch (e) {
        if (e.toString() === 'Error: both async and sync fetching of the wasm failed') location.reload();
        console.log(e);
        
        fadeOut(loading);
        fadeIn(error, true);
    }
})();



