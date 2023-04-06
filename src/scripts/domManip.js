import { footer, headerButtons, headerCenter, list, loading, main, map, welcome } from "./selectors";

export const fadeOut = function(element) {
    element.style('opacity', 0);
    setTimeout(() => {
        element.style('display', 'none');
    }, 500);
}

export const fadeIn = function(element, container) {
    element.style('opacity', 1);

    if (element.node().tagName === 'UL') {
        element.style('display', 'grid');
    } else {
        element.style('display', container ? 'flex' : 'block');
    }
}

export const fadeInList = function() {
    fadeIn(list);
    list.style('border-color', 'rgba(128, 128, 128, 0.8)');
    list.style('background-color', 'rgba(211, 211, 211, 0.2)')
}

export const fadeOutList = function() {
    fadeOut(list);
    list.style('border-color', 'rgba(128, 128, 128, 0)');
    list.style('background-color', 'rgba(211, 211, 211, 0)')
}

export const fadeInMain = function(transitMap) {
    fadeOut(welcome)
    fadeOut(loading);

    fadeIn(main, true);
    fadeIn(headerCenter, true);
    
    setTimeout(() => {
        fadeIn(headerButtons, true);
        fadeInList();
        fadeIn(footer, true);
        transitMap.createAgencyElements();
        fadeIn(map);
    }, 1500);
}

export const fadeInWelcome = function() {
    fadeOut(loading);
    fadeOut(main);

    fadeIn(welcome, true);
}

export const getLocation = async () => {
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
}