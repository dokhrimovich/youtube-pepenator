import { pepeText } from './pepe.text';
import { throttle } from './utils';

const adSelector = '.ad-interrupting';
const playerBarHeight = 48;

const createTheCurtain = () => {
    const existingCurtainEl = document.querySelector('.pepe-add-curtain');

    if (existingCurtainEl) {
        return existingCurtainEl;
    }

    const preEl = document.createElement('pre');
    preEl.innerText = pepeText;
    preEl.style.fontFamily = 'Courier New';
    preEl.style.lineHeight = '.5em';
    preEl.style.color = 'green';

    const curtainEl = document.createElement('div');
    curtainEl.classList.add('pepe-add-curtain');
    curtainEl.style.position = 'fixed';
    curtainEl.style.backgroundColor = 'antiquewhite';
    curtainEl.style.textAlign = 'center';
    curtainEl.style.opacity = '.95';

    curtainEl.append(preEl);

    document.body.append(curtainEl);

    return curtainEl;
};

const updateCurtain = (playerRect) => {
    const curtainEl = document.querySelector('.pepe-add-curtain');

    if (!curtainEl) {
        return;
    }

    const { fontSize, width, height, top, left } = calcStyle(playerRect);
    const preEl = curtainEl.querySelector('pre');

    preEl.style.fontSize = fontSize;

    curtainEl.style.width = width;
    curtainEl.style.height = height;
    curtainEl.style.top = top;
    curtainEl.style.left = left;

    return curtainEl;
};

const calcStyle = ({ x, y, width, height }) => {
    const fortSize = (height - playerBarHeight) / 75;

    return {
        fontSize: fortSize + 'px',
        width: width + 'px',
        height: (height - playerBarHeight) + 'px',
        left: x + 'px',
        top: y + 'px'
    };
};

const onAdResize = throttle(([entry]) => {
    const adEl = entry.target;

    updateCurtain(adEl.getBoundingClientRect());
}, 100);

const onScroll = throttle(() => {
    const adEl = document.querySelector(adSelector);

    if (!adEl) {
        return;
    }

    updateCurtain(adEl.getBoundingClientRect());
}, 100);

export const releaseThePepe = () => {
    const adEl = document.querySelector(adSelector);

    if (!adEl) {
        return () => {};
    }

    const curtainEl = createTheCurtain();
    const resizeObserver =  new window.ResizeObserver(onAdResize);

    const hidePepe = () => {
        curtainEl.style.display = 'none';
        resizeObserver.unobserve(adEl);

        curtainEl.removeEventListener('dblclick', hidePepe);
        document.removeEventListener('scroll', onScroll);
    };

    document.addEventListener('scroll', onScroll);
    curtainEl.addEventListener('dblclick', hidePepe);
    updateCurtain(adEl.getBoundingClientRect());

    curtainEl.style.removeProperty('display');
    resizeObserver.observe(adEl);

    return hidePepe;
};
