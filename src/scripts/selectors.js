import { select, selectAll } from 'd3';

// Containers
export const body = select('body');
export const main = select('.main-container');
export const map = select('#map');
export const loading = select('.loading-container');
export const error = select('.error-container');
export const welcome = select('.welcome-container');

// Main Container
export const header = select('header');
export const content = select('.content');
export const footer = select('footer');

// Header
export const headerCenter = select('.header-center');
export const headerButtons = selectAll('.side-buttons');
export const navbar = select('nav');
export const navbarToggle = select('.fa-bars');
export const mapToggle = select('.fa-map-location-dot');
export const locationToggle = select('.fa-location-dot');
export const settingsToggle = select('.fa-gear');
export const reloadButton = select('.reload-button');
export const settings = select('.settings > ul');

// Content
export const agencyList = selectAll('.agency-list');

// Footer
export const feedProgress = select('.feed-progress');

// Welcome
export const continueButton = select('.continue');