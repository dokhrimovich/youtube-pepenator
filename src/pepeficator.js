import { pepeText } from './pepe.text';
import { findInDOM } from './utils';

const adSelector = '.ytp-ad-player-overlay-skip-or-preview';
const playerBarHeight = 48;

const updateCurtain = (playerRect) => {
    const curtainEl = findInDOM('.pepe-add-curtain');

    if (!curtainEl) {
        return;
    }

    const preEl = curtainEl.querySelector('pre');
    const { fontSize, width, height, top, left } = calcStyle(playerRect);

    preEl.style.fontSize = fontSize;

    curtainEl.style.width = width;
    curtainEl.style.height = height;
    curtainEl.style.top = top;
    curtainEl.style.left = left;

    return curtainEl;
};

const createTheCurtain = (playerRect, onDblClick) => {
    const { fontSize, width, height, top, left } = calcStyle(playerRect);

    const preEl = document.createElement('pre');
    preEl.innerText = pepeText;
    preEl.style.fontSize = fontSize;
    preEl.style.fontFamily = 'Courier New';
    preEl.style.lineHeight = '.5em';
    preEl.style.color = 'green';

    const curtainEl = document.createElement('div');
    curtainEl.classList.add('pepe-add-curtain');
    curtainEl.style.position = 'absolute';
    curtainEl.style.backgroundColor = 'antiquewhite';
    curtainEl.style.width = width;
    curtainEl.style.height = height;
    curtainEl.style.top = top;
    curtainEl.style.left = left;
    curtainEl.style.textAlign = 'center';
    curtainEl.style.opacity = '.95';

    curtainEl.append(preEl);

    curtainEl.addEventListener('dblclick', onDblClick);

    document.body.append(curtainEl);

    return curtainEl;
}

const calcStyle = ({ top, right, bottom, left }) => {
    const fortSize = (bottom - top - playerBarHeight) / 75;

    return {
        fontSize: fortSize + 'px',
        width: (right - left) + 'px',
        height: (bottom - top - playerBarHeight) + 'px',
        top: top + 'px',
        left: left + 'px'
    };
};

const onResize = ([entry]) => {
    const adEl = entry.target;
    const { top, right, bottom, left } = adEl.getBoundingClientRect();

    updateCurtain({ top, right, bottom, left });
};

export const releaseThePepe = () => {
    const adEl = findInDOM(adSelector);
    const resizeObserver =  new window.ResizeObserver(onResize);
    const { top, right, bottom, left } = adEl.getBoundingClientRect();
    const curtainEl = updateCurtain({ top, right, bottom, left }) ||
        createTheCurtain({ top, right, bottom, left });

    const pepeOut = () => {
        curtainEl.style.display = 'none';
        resizeObserver.unobserve(adEl);
    };

    curtainEl.style.removeProperty('display');
    resizeObserver.observe(adEl);

    return pepeOut;
};
