import { EventManager } from './eventsManager';
import { addCorrectors, removeCorrectors } from './accessibilityCorrector';
import { getIsMuted, isAdPlaying, adProbablyUnskippable, tryScipAd, clickMute, mute, getCurrentVideoId, closeAdPopup } from './utils';

let eventManager;
let videoId = null;

const startAdWatcher = () => {
    let adStartedOn;

    const adWatcher = () => {
        if (!isAdPlaying()) {
            adStartedOn && eventManager.emit('adEnded');

            return;
        }

        !adStartedOn && eventManager.emit('adStarted');
    };

    const removeAdWatcher = () => {
        if (adID) {
            clearInterval(adID);
            eventManager.unsubscribe('adWatcher:*');
        }
    };

    const adID = setInterval(adWatcher, 400);

    eventManager.subscribe('adWatcher:adStarted', () => {
        adStartedOn = new Date();

        if (adProbablyUnskippable()) {
            let shouldUnmuteAfterAd = mute();

            if (shouldUnmuteAfterAd) {
                eventManager.subscribe('adEnded', () => {
                    if (videoId && getIsMuted()) {
                        clickMute();
                    }
                });
            }
        }
    });
    eventManager.subscribe('adWatcher:adEnded', () => {
        adStartedOn = null;
        removeAdWatcher();
    });
    eventManager.subscribe('adWatcher:videoEnded', () => {
        removeAdWatcher();
    });
};

const startRouterWatcher = () => {
    let videoStartedOn;

    const pseudoRouterWatcher = () => {
        videoId = getCurrentVideoId();

        if (!videoId) {
            videoStartedOn && eventManager.emit('videoEnded');

            return;
        }

        !videoStartedOn && eventManager.emit('videoStarted');

        if (videoStartedOn) {
            tryScipAd();
            closeAdPopup();
        }
    };

    const routerID = setInterval(pseudoRouterWatcher, 500);

    const removeRouterWatcher = () => {
        if (routerID) {
            clearInterval(routerID);
            eventManager.unsubscribe('router:*');
        }
    };

    eventManager.subscribe('router:videoStarted', () => {
        videoStartedOn = new Date();

        startAdWatcher();
        addCorrectors();
    });
    eventManager.subscribe('router:videoEnded', () => {
        videoStartedOn = null;

        removeCorrectors();
    });
};

const init = () => {
    if (window.GFYS) {
        return;
    }

    eventManager = new EventManager();

    startRouterWatcher();

    window.GFYS = true;
};

init();
