import { getIsMuted, isAdPlaying, adProbablyUnskippable, pleaseClick, clickMute, mute, getCurrentVideoId } from './utils';
import { addCorrectors, removeCorrectors } from './accessibilityCorrector';
import { EventManager } from './eventsManager';

let eventManager;
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
        videoStartedOn && eventManager.emit('videoOff');

        return;
    }

    !videoStartedOn && eventManager.emit('videoOn');

    if (videoStartedOn) {
        pleaseClick(skipVideoAddBtnSelector);
        pleaseClick(popupAddCloseBtnSelector);
    }
};

const adWatcher = () => {
    if (!isAdPlaying()) {
        adStartedOn && eventManager.emit('adOff');

        return;
    }

    !adStartedOn && eventManager.emit('adOn');

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
    eventManager.subscribe('adOn', onAdOn());
    eventManager.subscribe('adOff', onAdOff());
};

const removeAdWatcher = () => {
    if (adID) {
        clearInterval(adID);
        eventManager.unsubscribe('adOn');
        eventManager.unsubscribe('adOff');
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

    eventManager = new EventManager();

    addRouterWatcher();

    window.GFYS = true;
};

init();
