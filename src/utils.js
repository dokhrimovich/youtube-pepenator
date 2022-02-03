const muteBtnSelector = '.ytp-mute-button';
const adSkipBtnSelector = '.ytp-ad-skip-button';
const volumeSliderSelector = '.ytp-volume-slider-handle';
const adSelector = '.ytp-ad-player-overlay-skip-or-preview';
const popupAdCloseBtnSelector = '.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button';

const pleaseClick = (selector) => {
    const el = findInDOM(selector);

    if (el) {
        el.click();
    }
};

export const findInDOM = (selector) => {
    const elements = document.querySelectorAll(selector);

    return Array.from(elements).find(el => el.offsetParent);
};

export const getIsMuted = () => {
    try {
        const sliderHandleEl = findInDOM(volumeSliderSelector);
        const parsedPosition = parseInt(sliderHandleEl?.style?.left);
        const sliderHandlePosition = Number.isNaN(parsedPosition) ? 100 : parsedPosition;

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

// export const adProbablyUnskippable = (adStartedOn) => new Date() - adStartedOn > 1000 || !findInDOM(adSkipBtnSelector);
export const adProbablyUnskippable = () => !findInDOM(adSkipBtnSelector);

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

export const tryScipAd = () => {
    pleaseClick(adSkipBtnSelector);
};

export const closeAdPopup = () => {
    pleaseClick(popupAdCloseBtnSelector);
};

export const withLogger = (prefix = '') => {
    let debug = !!localStorage.getItem('gfys_debug');

    return debug
        ? (what, ...data) => {
            console.debug(['DEBUG:', prefix, what].filter(Boolean).join(' '), ...data);
        }
        : () => {};
};
