import { content, footer, headerButtons, headerCenter, loading, main, map, welcome } from "./selectors";

export const fadeOut = function(element) {
    element.style('opacity', 0);
    setTimeout(() => {
        element.style('display', 'none');
    }, 500);
}

export const fadeIn = function(element, container) {
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

export const fadeInWelcome = function() {
    loading.style('opacity', 0);
    loading.style('z-index', 0);

    welcome.style('opacity', 1);
    welcome.style('z-index', 1);
}

export const getLocation = async () => {
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true }));
}