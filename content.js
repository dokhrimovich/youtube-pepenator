(function () {
    let videoStartedOn;
    let adStartedOn;
    let videoId = null;
    let wasMuteAttemptMade = false;
    let shouldUnmuteAfterAd = false;
    const popupAddCloseBtnSelector = '.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button';
    const skipVideoAddBtnSelector = '.ytp-ad-skip-button';
    const muteBtnSelector = '.ytp-mute-button';
    const addSelector = '.ytp-ad-player-overlay-skip-or-preview';
    const volAreaSelector = '.ytp-volume-area';
    const progressBarSelector = '.ytp-progress-bar';
    // const timeClipSelector = '.ytp-time-clip-icon';

    // region utils

    const getIsMuted = () => {
        try {
            const sliderHandleEl = document.querySelector('.ytp-volume-slider-handle');
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

    const adProbablyUnskippable = () => new Date() - adStartedOn > 1000;

    const pleaseClick = (selector) => {
        const btnEl = document.querySelector(selector);

        if (btnEl) {
            btnEl.click();
            //btnEl.dispatchEvent(new Event('click'));
        }
    };

    const clickMute = () => pleaseClick(muteBtnSelector);

    const mute = () => {
        if (wasMuteAttemptMade) {
            return;
        }

        wasMuteAttemptMade = true;
        const isMuted = getIsMuted();

        shouldUnmuteAfterAd = !isMuted;

        !isMuted && clickMute();
    };

    const checkVideoId = () => {
        let url = new URL(window.location.href);

        videoId = url.searchParams.get('v');
    };

    const isAdPlaying = () => {
        return !!document.querySelector(addSelector);
    };

    // endregion

    // region accessibility correctors

    const accessibilityCorrector = () => {
        window.setTimeout(() => {
            document.activeElement.blur();
        }, 200);
    };

    const addCorrectors = () => {
        const volAreaEl = document.querySelector(volAreaSelector);
        const progressBarEl = document.querySelector(progressBarSelector);

        volAreaEl?.addEventListener('click', accessibilityCorrector);
        progressBarEl?.addEventListener('click', accessibilityCorrector);
    };

    const removeCorrectors = () => {
        const volAreaEl = document.querySelector(volAreaSelector);
        const progressBarEl = document.querySelector(progressBarSelector);

        volAreaEl?.removeEventListener('click', accessibilityCorrector);
        progressBarEl?.removeEventListener('click', accessibilityCorrector);
    };

    // endregion

    // region event handlers

    const onVideoOn = () => {
        videoStartedOn = new Date();

        addAdWatcher();
        addCorrectors();
    };

    const onVideoOff = () => {
        videoStartedOn = null;

        onAdOff();
        removeAdWatcher();
        removeCorrectors();
    };

    const onAdOn = () => {
        adStartedOn = new Date();
    };

    const onAdOff = () => {
        adStartedOn = null;

        if (videoId && wasMuteAttemptMade && shouldUnmuteAfterAd && getIsMuted()) {
            clickMute();
        }

        wasMuteAttemptMade = false;
        shouldUnmuteAfterAd = false;
    };

    // endregion

    // region watchers

    const pseudoRouterWatcher = () => {
        checkVideoId();

        if (!videoId) {
            videoStartedOn && onVideoOff();

            return;
        }

        !videoStartedOn && onVideoOn();

        if (videoStartedOn) {
            pleaseClick(skipVideoAddBtnSelector);
            pleaseClick(popupAddCloseBtnSelector);
        }
    };

    const adWatcher = () => {
        if (!isAdPlaying()) {
            adStartedOn && onAdOff();

            return;
        }

        !adStartedOn && onAdOn();

        if (adStartedOn && adProbablyUnskippable()) {
            mute();
        }
    };

    // endregion

    // region watcher managers

    let routerID;
    let adID;

    const addAdWatcher = () => {
        removeAdWatcher();

        adID = setInterval(adWatcher, 500);
    };

    const removeAdWatcher = () => {
        if (adID) {
            clearInterval(adID);
        }
    };

    const removeRouterWatcher = () => {
        if (routerID) {
            clearInterval(routerID);
        }
    };

    const addRouterWatcher = () => {
        removeRouterWatcher();

        routerID = setInterval(pseudoRouterWatcher, 500);
    };

    // endregion

    const init = () => {
        if (window.GFYS) {
            return;
        }

        addRouterWatcher();

        window.GFYS = true;
    };

    init();
})();
