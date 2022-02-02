import { EventManager } from './eventsManager';
import { addCorrectors, removeCorrectors } from './accessibilityCorrector';
import {
    getIsMuted, isAdPlaying, adProbablyUnskippable, tryScipAd,
    clickMute, mute, getCurrentVideoId, closeAdPopup, withLogger
} from './utils';

let eventManager;
let videoId = null;

const startAdWatcher = () => {
    let adStartedOn;
    let log = withLogger('');

    const adWatcher = () => {
        if (adStartedOn && !isAdPlaying()) {
            adStartedOn = null;
            log('event', 'adEnded');
            eventManager.emit('adEnded');

            return;
        }

        if (!adStartedOn && isAdPlaying()) {
            adStartedOn = new Date();
            log('event', 'adStarted');
            eventManager.emit('adStarted');
        }
    };

    const removeAdWatcher = () => {
        log('AdWatcher removed');
        adStartedOn = null;
        adID && clearInterval(adID);
        eventManager.unsubscribe('adWatcher:*');
    };

    const adID = setInterval(adWatcher, 400);

    eventManager.subscribe('adWatcher:adStarted', () => {
        if (adProbablyUnskippable()) {
            let shouldUnmuteAfterAd = mute();
            log('Unskippable Ad', 'shouldUnmuteAfterAd = ' + shouldUnmuteAfterAd);

            if (shouldUnmuteAfterAd) {
                eventManager.once('adEnded', () => {
                    if (videoId && getIsMuted()) {
                        log('UNMUTE' , 'Clicked');
                        clickMute();
                    } else {
                        log('UNMUTE' , 'Not clicked');
                    }
                });
            }
        }
    });

    eventManager.subscribe('adWatcher:videoEnded', () => {
        removeAdWatcher();
    });
};

const startRouterWatcher = () => {
    let videoStartedOn;
    let log = withLogger('');

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

        log('AdWatcher started');
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

    // localStorage.setItem('gfys_debug', 1);

    eventManager = new EventManager();

    startRouterWatcher();

    window.GFYS = true;
};

init();
