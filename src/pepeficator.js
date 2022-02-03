import { pepeText } from './pepe.text';
import { findInDOM } from './utils';

const playerSelector = '.ytd-player';

const createTheCurtain = ({ top, right, bottom, left }) => {
    const lineHeight = (bottom - top - 1) / 150;
    const fortSize = lineHeight * 2;

    const preEl = document.createElement('pre');
    preEl.innerText = pepeText;
    preEl.style.lineHeight = lineHeight + 'px';
    preEl.style.fontSize = fortSize + 'px';
    preEl.style.fontFamily = 'Courier New';
    preEl.style.color = 'green';

    const pepeContainer = document.createElement('div');
    pepeContainer.style.position = 'absolute';
    pepeContainer.style.backgroundColor = 'antiquewhite';
    pepeContainer.style.width = (right - left) + 'px';
    pepeContainer.style.height = (bottom - top) + 'px';
    pepeContainer.style.top = top + 'px';
    pepeContainer.style.left = left + 'px';
    pepeContainer.style.textAlign = 'center';
    pepeContainer.style.opacity = '.9';

    pepeContainer.append(preEl);


    return pepeContainer;
}

export const releaseThePepe = () => {
    let meh = false;
    const playerEl = findInDOM(playerSelector);
    const { top, right, bottom, left } = playerEl.getBoundingClientRect();
    const curtainEl = createTheCurtain({ top, right, bottom, left });

    const pepeOut = () => {
        if (meh) {
            return;
        }

        curtainEl.remove();
        meh = true;
    };

    curtainEl.addEventListener('dblclick', pepeOut);

    document.body.append(curtainEl);

    return pepeOut;
};
