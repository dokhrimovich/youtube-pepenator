const muteBtnSelector = 'ytd-watch-flexy .ytp-mute-button';
const sliderSelector = 'ytd-watch-flexy .ytp-ad-player-overlay-skip-or-preview';
const addSelector = '.ytp-ad-player-overlay-skip-or-preview';

export const getIsMuted = () => {
    try {
        const sliderHandleEl = document.querySelector(sliderSelector);
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
    const btnEl = document.querySelector(selector);

    if (btnEl) {
        btnEl.click();
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
    return !!document.querySelector(addSelector);
};
