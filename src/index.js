import { getIsMuted, isAdPlaying, adProbablyUnskippable, pleaseClick, clickMute, mute, getCurrentVideoId } from './utils';
import { addCorrectors, removeCorrectors } from './accessibilityCorrector';

let videoStartedOn;
let adStartedOn;
let videoId = null;
let wasMuteAttemptMade = false;
let shouldUnmuteAfterAd = false;
const popupAddCloseBtnSelector = '.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button';
const skipVideoAddBtnSelector = '.ytp-ad-skip-button';

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

    if (videoId && shouldUnmuteAfterAd && getIsMuted()) {
        clickMute();
    }

    wasMuteAttemptMade = false;
    shouldUnmuteAfterAd = false;
};

// endregion

// region watchers

const pseudoRouterWatcher = () => {
    videoId = getCurrentVideoId();

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

    if (adStartedOn && adProbablyUnskippable(adStartedOn) && !wasMuteAttemptMade) {
        shouldUnmuteAfterAd = mute();
        wasMuteAttemptMade = true;
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
