const volAreaSelector = '.ytp-volume-area';
const progressBarSelector = '.ytp-progress-bar';

const accessibilityCorrector = () => {
    window.setTimeout(() => {
        document.activeElement.blur();
    }, 200);
};

export const addCorrectors = () => {
    const volAreaEl = document.querySelector(volAreaSelector);
    const progressBarEl = document.querySelector(progressBarSelector);

    volAreaEl?.addEventListener('click', accessibilityCorrector);
    progressBarEl?.addEventListener('click', accessibilityCorrector);
};

export const removeCorrectors = () => {
    const volAreaEl = document.querySelector(volAreaSelector);
    const progressBarEl = document.querySelector(progressBarSelector);

    volAreaEl?.removeEventListener('click', accessibilityCorrector);
    progressBarEl?.removeEventListener('click', accessibilityCorrector);
};
