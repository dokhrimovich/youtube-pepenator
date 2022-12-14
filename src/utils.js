const muteBtnSelector = '.ytp-mute-button';
const adSkipBtnSelector = '.ytp-ad-skip-button';
const volumeSliderSelector = '.ytp-volume-slider-handle';
const adSelector = '.ad-interrupting';
const popupAdCloseBtnSelector = '.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button';

const pleaseClick = (selector, attempts = 1, fallback) => {
    let timesTried = 0;

    const tryClick = () => {
        timesTried++;
        const el = findInDOM(selector);

        if (el) {
            el.click();

            return;
        }

        if (timesTried >= attempts) {
            fallback?.();

            return;
        }

        window.setTimeout(tryClick, 50);
    };

    tryClick();

};

/**
 * @param {String} selector
 * @returns {Element}
 */
export const findInDOM = (selector) => {
    const elements = document.querySelectorAll(selector);

    return Array.from(elements).find(el => el.offsetParent);
};

// todo rethink and fix
export const getIsMuted = () => {
    try {
        const sliderHandleEl = findInDOM(volumeSliderSelector);

        if (!sliderHandleEl) {
            return false;
        }

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

const tryUnmuteInStorage = () => {
    const playerData = JSON.parse(localStorage.getItem('yt-player-volume'));
    const volumeData = JSON.parse(playerData.data);

    const newVolumeData = JSON.stringify({ ...volumeData, muted: false });
    const newPlayerData = JSON.stringify({ ...playerData, data: newVolumeData });

    localStorage.setItem('yt-player-volume', newPlayerData);
};

// export const adProbablyUnskippable = (adStartedOn) => new Date() - adStartedOn > 1000 || !findInDOM(adSkipBtnSelector);
export const adProbablyUnskippable = () => !findInDOM(adSkipBtnSelector);

export const clickMute = () => pleaseClick(muteBtnSelector);

export const mute = () => {
    // if (getIsMuted()) {
    //     return () => {};
    // }

    pleaseClick(`${adSelector} ${muteBtnSelector}`);

    return () => {
        pleaseClick(`:not(${adSelector}) ${muteBtnSelector}`, 3, tryUnmuteInStorage);
    };
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

export const throttle = (fn, delay) => {
    let prevCall = 0;

    return (...args) => {
        let now = new Date().getTime();

        if (now - prevCall > delay) {
            prevCall = now;
            fn(...args);
        }
    }
};
