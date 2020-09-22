import { applyMixins } from "../../shared"

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
    REMOTE_CONNECTION_CHANGED = 'REMOTE_CONNECTION_CHANGED',
}

export function signalEmitter<T extends { new(...args: any[]): {} }>(
    constructor: T
) {
    applyMixins(constructor, [SignalEmitter])

    return class extends constructor {
        handlers = {}
    }
}

export interface ISignalEmitter {
    registerHandler(handler: any, signal: SIGNALS, callback: Function): void
    unregisterSignalHandler(handler: any, signal: SIGNALS): void
    sendSignal(who: any, what: SIGNALS, ...data: any): void
}

export class SignalEmitter implements ISignalEmitter {

    handlers: { [signal: string]: { handler: any, callback: Function }[] } = {}

    registerHandler(handler: any, signal: SIGNALS, cb: any) {
        if (this.handlers[signal] === undefined) {
            this.handlers[signal] = []
        }

        for (var i = 0; i < this.handlers[signal].length; i++) {
            var entry = this.handlers[signal][i]
            if (entry.handler == handler && entry.callback == cb) {
                return
            }
        }

        this.handlers[signal].push({ handler: handler, callback: cb })
    }

    unregisterSignalHandler(handler: any, signal: SIGNALS) {
        if (this.handlers[signal] === undefined) return

        for (var i = 0; i < this.handlers[signal].length; i++) {
            var entry = this.handlers[signal][i]
            if (entry.handler == handler) {
                this.handlers[signal].splice(i, 1)
                return
            }
        }
    }

    unregisterHandler(handler: any) {
        if (this.handlers === undefined) return

        for (const signal of Object.keys(this.handlers)) {
            for (var i = 0; i < this.handlers[signal].length; i++) {
                var entry = this.handlers[signal][i]
                if (entry.handler == handler) {
                    this.handlers[signal].splice(i, 1)
                }
            }
        }
    }

    sendSignal(emitter: ISignalEmitter, signal: SIGNALS, ...data: any) {
        if (this.handlers[signal] === undefined) return

        for (var i = 0; i < this.handlers[signal].length; i++) {
            var o = this.handlers[signal][i]
            o.callback.bind(o.handler)(emitter, ...data)
        }
    }
}


