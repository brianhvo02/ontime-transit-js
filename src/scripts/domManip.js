import { content, continueButton, footer, headerButtons, headerCenter, loading, map, welcome } from "./selectors";

export const fadeInMain = () => {
    welcome.style('opacity', 0);
    loading.style('opacity', 0);
    headerCenter.style('opacity', 1);
    setTimeout(() => {
        headerButtons.style('opacity', 1);
        content.style('opacity', 1);
        footer.style('opacity', 1);
        map.style('opacity', 1);
    }, 1500);
}

continueButton.on('click', fadeInMain);