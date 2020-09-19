import { format } from 'date-fns'
import { Types } from "../../common/types"
import { signalEmitter, SignalEmitter, SIGNALS } from './signal'

export interface Log extends SignalEmitter { }

@signalEmitter
export class Log implements Log {
    entries: Types.LogEntry[]

    constructor(config?: Partial<Log>) {
        this.entries = config?.entries || []
    }

    addEntry(message: string) {
        const timestamp = format(Date.now(), 'yyyy-MM-dd HH:mm:ss.SSS')
        const entry: Types.LogEntry = { timestamp, message }
        this.entries.push(entry)
        this.sendSignal(this, SIGNALS.LOG_CHANGED, entry)
    }
}
