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
export const headerCenter = select('.center');
export const headerButtons = selectAll('.side-buttons');
export const navbar = select('nav');
export const navbarToggle = select('.fa-bars');

// Content
export const agencyList = select('.agency-list');

// Footer
export const feedProgress = select('.feed-progress');

// Welcome
export const continueButton = select('.continue');