import { content, footer, navbar, navbarToggle } from "./selectors";

const handleBars = () => {
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

navbarToggle.on('click', handleBars);