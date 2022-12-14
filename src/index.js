import { EventManager } from './eventsManager';
import { releaseThePepe } from './pepeficator';
import { addCorrectors, removeCorrectors } from './accessibilityCorrector';
import {
    isAdPlaying, adProbablyUnskippable, tryScipAd,
    mute, getCurrentVideoId, closeAdPopup, withLogger
} from './utils';

let eventManager;
let videoId = null;

const startAdWatcher = () => {
    let adStartedOn;
    let onAddEnded;
    let log = withLogger('');

    const adWatcher = () => {
        if (!adStartedOn && isAdPlaying()) {
            adStartedOn = new Date();
            log('event', 'adStarted');

            onAddEnded = onAddStarted();

            return;
        }

        if (adStartedOn && !isAdPlaying()) {
            adStartedOn = null;
            log('event', 'adEnded');
            onAddEnded?.();
        }
    };

    const onAddStarted = () => {
        if (!adProbablyUnskippable()) {
            return;
        }

        log('Unskippable Ad (((');

        const pepeOut = releaseThePepe();
        const unmute = mute();

        return () => {
            pepeOut();
            unmute();
        }
    };

    const adID = setInterval(adWatcher, 400);

    adWatcher();

    return () => {
        log('AdWatcher removed');

        adStartedOn && onAddEnded?.();

        adStartedOn = null;
        adID && clearInterval(adID);
    };
};

const startRouterWatcher = () => {
    let videoStartedOn;
    let removeAddWatcher;
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

    pseudoRouterWatcher();

    const removeRouterWatcher = () => {
        if (routerID) {
            clearInterval(routerID);
            eventManager.unsubscribe('router:*');
        }
    };

    eventManager.subscribe('router:videoStarted', () => {
        videoStartedOn = new Date();

        log('AdWatcher started');
        removeAddWatcher = startAdWatcher();
        addCorrectors();
    });
    eventManager.subscribe('router:videoEnded', () => {
        videoStartedOn = null;

        removeAddWatcher?.();
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
