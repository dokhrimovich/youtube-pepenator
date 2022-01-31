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
            delete this.listeners[nameOrListener];

            return;
        }

        if (typeof nameOrListener === 'function') {
            Object.entries(this.listeners)
                .some((name, listeners) => {
                    const index = listeners.findIndex(nameOrListener);

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
    }

    emit(name, data) {
        this.listeners[name]?.forEach((listener) => {
            listener?.(null, data);
        });
    }

}