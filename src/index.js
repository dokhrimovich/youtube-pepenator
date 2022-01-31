import { EventManager } from './eventsManager';
import { addCorrectors, removeCorrectors } from './accessibilityCorrector';
import { getIsMuted, isAdPlaying, adProbablyUnskippable, tryScipAd, clickMute, mute, getCurrentVideoId, closeAdPopup } from './utils';

let eventManager;
let videoStartedOn;
let adStartedOn;
let videoId = null;
let wasMuteAttemptMade = false;
let shouldUnmuteAfterAd = false;

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
        tryScipAd();
        closeAdPopup();
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
    eventManager.subscribe('adOn', onAdOn);
    eventManager.subscribe('adOff', onAdOff);
};

const removeAdWatcher = () => {
    if (adID) {
        clearInterval(adID);
        eventManager.unsubscribe('adOn');
        eventManager.unsubscribe('adOff');
    }
};

const addRouterWatcher = () => {
    removeRouterWatcher();

    routerID = setInterval(pseudoRouterWatcher, 500);
    eventManager.subscribe('videoOn', onVideoOn);
    eventManager.subscribe('videoOff', onVideoOff);
};

const removeRouterWatcher = () => {
    if (routerID) {
        clearInterval(routerID);
        eventManager.unsubscribe('videoOn');
        eventManager.unsubscribe('videoOff');
    }
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
