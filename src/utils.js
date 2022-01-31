const muteBtnSelector = '.ytp-mute-button';
const sliderSelector = '.ytp-volume-slider-handle';
const adSelector = '.ytp-ad-player-overlay-skip-or-preview';

const findInDOM = (selector) => {
    const elements = document.querySelectorAll(selector);

    return Array.from(elements).find(el => el.offsetParent);
};

export const getIsMuted = () => {
    try {
        const sliderHandleEl = findInDOM(sliderSelector);
        const sliderHandlePosition = parseInt(sliderHandleEl?.style?.left) || 100;

        // // data: "{\"volume\":27,\"muted\":true}"
        // const volumeData = JSON.parse(localStorage.getItem('yt-player-volume')).data;
        // const muted = JSON.parse(volumeData).muted;
        //
        // return !!muted;

        return sliderHandlePosition === 0;
    } catch {
        return false;
    }
};

export const adProbablyUnskippable = (adStartedOn) => new Date() - adStartedOn > 1000;

export const pleaseClick = (selector) => {
    const el = findInDOM(selector);

    if (el) {
        el.click();
    }
};

export const clickMute = () => pleaseClick(muteBtnSelector);

export const mute = () => {
    const isMuted = getIsMuted();
    const shouldUnmuteAfterAd = !isMuted;

    !isMuted && clickMute();

    return shouldUnmuteAfterAd;
};

export const getCurrentVideoId = () => {
    let url = new URL(window.location.href);

    return url.searchParams.get('v');
};

export const isAdPlaying = () => {
    return !!document.querySelector(adSelector);
};
