export class EventManager {

    debug = false;

    listeners = {};

    constructor(debug) {
        this.debug = debug;
    }

    subscribe(name, listener) {
        this._log('subscribe', name)

        if (this.listeners[name]) {
            this.listeners[name].push(listener);

            return;
        }

        this.listeners[name] = [listener];
    }

    once(name, listener) {
        this._log('once', name);

        const wrappedListener = (...args) => {
            listener(...args);
            this._removeByListener(wrappedListener);
        }

        if (this.listeners[name]) {
            this.listeners[name].push(wrappedListener);

            return;
        }

        this.listeners[name] = [wrappedListener];
    }

    unsubscribe(nameOrListener) {
        this._log('unsubscribe', nameOrListener);

        if (typeof nameOrListener === 'string') {
            const [alias, name] = nameOrListener.split(':');

            if (alias === nameOrListener || alias && name && name !== '*') {
                this._removeByName(nameOrListener);
                return;
            }

            if (alias && (!name || name === '*')) {
                this._removeByAlias(alias);
                return;
            }
        }

        if (typeof nameOrListener === 'function') {
            this._removeByListener(nameOrListener);
        }
    }

    emit(event, data) {
        const foundListeners = Object.keys(this.listeners)
            .filter(name => name === event || name.match(/.*:(.*)/)?.[1] === event)
            .flatMap(name => this.listeners[name]);

        this._log('emit', event, 'foundListeners: ', foundListeners.length);

        foundListeners.forEach(listener => listener?.(data));
    }

    _removeByName(name) {
        delete this.listeners[name];

        this._logListenersSnapshot();
    }

    _removeByListener(fn) {
        Object.entries(this.listeners)
            .some(([name, listeners]) => {
                const index = listeners.indexOf(fn);

                if (index === -1) {
                    return false;
                }

                this.listeners[name].splice(index, 1);

                if (!this.listeners[name].length) {
                    delete this.listeners[name];
                }

                return true;
            });

        this._logListenersSnapshot();
    }

    _removeByAlias(alias) {
        Object.keys(this.listeners)
            .filter(name => name.startsWith(alias + ':'))
            .forEach(name => delete this.listeners[name]);

        this._logListenersSnapshot();
    }

    _log(what, ...data) {
        if (!this.debug) {
            return;
        }

        console.debug('DEBUG: EventManager ' + what, ...data);
    }

    _logListenersSnapshot() {
        const snapshot = Object.fromEntries(
            Object.entries(this.listeners)
                .map(([event, arr]) => [event, arr.length]));

        console.debug('DEBUG:', snapshot);
    }
}
