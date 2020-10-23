import { applyMixins } from "../../common/utils"

export enum SIGNALS {
    RESOURCE_ALLOCATION_UPDATED = 'RESOURCE_ALLOCATION_UPDATED',

    TASK_SCHEDULED = 'TASK_SCHEDULED',
    TASK_UNSCHEDULED = 'TASK_UNSCHEDULED',
    PROCESS_STARTED = 'PROCESS_STARTED',
    PROCESS_UPDATED = 'PROCESS_UPDATED',
    PROCESS_FINISHED = 'PROCESS_FINISHED',
    PROCESS_PRIORITY_CHANGED = 'PROCESS_PRIORITY_CHANGED',

    STREAM_ALLOCATION_CHANGED = 'STREAM_ALLOCATION_CHANGED',
    BOUNCE_ALLOCATION_CHANGED = 'BOUNCE_ALLOCATION_CHANGED',

    LOG_CHANGED = 'LOG_CHANGED',
    NEW_REMOTE_CONNECTION = 'NEW_REMOTE_CONNECTION',
    REMOTE_CONNECTION_CHANGED = 'REMOTE_CONNECTION_CHANGED',
}

export function signalEmitter<T extends { new(...args: any[]): {} }>(
    constructor: T
) {
    applyMixins(constructor, [SignalEmitter, Propagator])

    return class extends constructor {
        callbacks = {}
        watchers: Set<Watcher> = new Set()
    }
}

export function watcher<T extends { new(...args: any[]): {} }>(constructor: T) {

    applyMixins(constructor, [Watcher, Propagator])

    return class extends constructor {
        watchers: Set<Watcher> = new Set()
    }
}

export function propagator<T extends { new(...args: any[]): {} }>(constructor: T) {

    applyMixins(constructor, [Propagator])

    return class extends constructor {
        watchers: Set<Watcher> = new Set()
    }
}

export interface Watcher extends Propagator {
    watch(propagator: Propagator): void
    unwatch(propagator: Propagator): void
    handlePropagation(signal: SIGNALS): void
}

export class Watcher {
    watch(propagator: Propagator) {
        propagator.watchers.add(this)
    }

    unwatch(propagator: Propagator) {
        propagator.watchers.delete(this)
    }
}




export interface Propagator {
    watchers: Set<Watcher>
    propagate(signal: SIGNALS): void
}

export class Propagator {
    propagate(signal: SIGNALS) {

        this.watchers.forEach(watcher => {

            if (watcher.handlePropagation) {
                watcher.handlePropagation(signal)
            }

            watcher.propagate(signal)
        })
    }
}



export interface SignalEmitter extends Propagator {
    registerHandler(handler: any, signal: SIGNALS, callback: Function): void

    /**
      * Removes handler from specified signal
      */
    unregisterSignalHandler(handler: any, signal: SIGNALS): void

    /**
     * Removes handler from all signals
     */
    unregisterHandler(handler: any): void
    sendSignal(who: any, what: SIGNALS, ...data: any): void
}

export class SignalEmitter implements SignalEmitter {

    callbacks: { [signal: string]: { handler: any, callback: Function }[] } = {}

    registerHandler(handler: any, signal: SIGNALS, cb: any) {
        if (this.callbacks[signal] === undefined) {
            this.callbacks[signal] = []
        }

        for (var i = 0; i < this.callbacks[signal].length; i++) {
            var entry = this.callbacks[signal][i]
            if (entry.handler == handler && entry.callback == cb) {
                console.error(`Duplicate registration from [${handler}] to signal [${signal}]`)
                return
            }
        }

        this.callbacks[signal].push({ handler: handler, callback: cb })
    }

    unregisterSignalHandler(handler: any, signal: SIGNALS) {
        if (this.callbacks[signal] === undefined) return

        for (var i = 0; i < this.callbacks[signal].length; i++) {
            var entry = this.callbacks[signal][i]
            if (entry.handler == handler) {
                this.callbacks[signal].splice(i, 1)
                return
            }
        }
    }

    unregisterHandler(handler: any) {
        if (this.callbacks === undefined) return

        for (const signal of Object.keys(this.callbacks)) {
            for (var i = 0; i < this.callbacks[signal].length; i++) {
                var entry = this.callbacks[signal][i]
                if (entry.handler == handler) {
                    this.callbacks[signal].splice(i, 1)
                }
            }
        }
    }

    sendSignal(emitter: SignalEmitter, signal: SIGNALS, ...data: any) {
        if (this.callbacks[signal] !== undefined) {

            for (var i = 0; i < this.callbacks[signal].length; i++) {
                var o = this.callbacks[signal][i]
                o.callback.bind(o.handler)(emitter, ...data)
            }
        }

        this.propagate(signal)
    }
}


