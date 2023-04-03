import { content, continueButton, footer, headerButtons, headerCenter, loading, main, map, mapToggle, navbar, navbarToggle, settings, settingsToggle, welcome } from "./selectors";

export const fadeInMain = function() {
    welcome.style('opacity', 0);
    welcome.style('z-index', 0);

    loading.style('opacity', 0);
    loading.style('z-index', 0);

    main.style('opacity', 1);
    main.style('z-index', 1);
    headerCenter.style('opacity', 1);
    
    setTimeout(() => {
        headerButtons.style('opacity', 1);
        content.style('opacity', 1);
        footer.style('opacity', 1);
        map.style('opacity', 1);
    }, 1500);
}

export const fadeOutMainInMap = function() {
    main.style('opacity', 0);
    main.style('z-index', 0);
    map.style('z-index', 1);
}

export const fadeInWelcome = function() {
    loading.style('opacity', 0);
    loading.style('z-index', 0);

    welcome.style('opacity', 1);
    welcome.style('z-index', 1);
}

export const getLocation = async () => {
    return new Promise(resolve => navigator.geolocation.getCurrentPosition(resolve));
}

export const handleBars = function() {
    if (navbar.style('width') === '250px') {
        navbarToggle.style('margin-left', '20px');
        content.style('margin-left', 0);
        footer.style('margin-left', 0);
        navbar.style('width', 0);
    } else {
        navbarToggle.style('margin-left', '270px');
        content.style('margin-left', '250px');
        footer.style('margin-left', '250px');
        navbar.style('width', '250px');
    }
}

export const handleGear = function() {
    if (settings.style('opacity') == 1) {
        settings.style('opacity', 0);
    } else {
        settings.style('opacity', 1);
    }
}