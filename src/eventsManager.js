export class EventManager {

    listeners = {};

    subscribe(name, listener) {
        if (this.listeners[name]) {
            this.listeners[name].push(listener);

            return;
        }

        this.listeners[name] = [listener];
    }

    unsubscribe(nameOrListener) {
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
        Object.keys(this.listeners)
            .filter(name => name === event || name.match(/.*:(.*)/)?.[1] === event)
            .forEach(name => this.listeners[name]?.forEach(listener => {
                listener?.(data);
            }));
    }

    _removeByName(name) {
        delete this.listeners[name];
    }

    _removeByListener(fn) {
        Object.entries(this.listeners)
            .some(([name, listeners]) => {
                const index = listeners.findIndex(fn);

                if (index === -1) {
                    return false;
                }

                this.listeners[name].splice(index, 1);

                if (!this.listeners[name].length) {
                    delete this.listeners[name];
                }

                return true;
            });
    }

    _removeByAlias(alias) {
        Object.keys(this.listeners)
            .filter(name => name.startsWith(alias + ':'))
            .forEach(name => delete this.listeners[name]);
    }
}
