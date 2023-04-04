import { content, continueButton, footer, headerButtons, headerCenter, loading, main, map, mapToggle, navbar, navbarToggle, settings, settingsToggle, welcome } from "./selectors";

const fadeOut = function(element) {
    element.style('opacity', 0);
    setTimeout(() => {
        element.style('display', 'none');
    }, 500);
}

const fadeIn = function(element, container) {
    element.style('display', container ? 'flex' : 'block');
    element.style('opacity', 1);
}

export const fadeInMain = function(transitMap) {
    welcome.style('opacity', 0);
    welcome.style('z-index', 0);

    fadeOut(loading);

    fadeIn(main, true);
    fadeIn(headerCenter, true);
    
    setTimeout(() => {
        fadeIn(headerButtons, true);
        fadeIn(content, true);
        fadeIn(footer, true);
        transitMap.createAgencyElements();
        fadeIn(map);
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
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true }));
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