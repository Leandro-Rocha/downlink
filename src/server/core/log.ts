import { format } from 'date-fns'
import { EntityType, GameEntity, Gui, Presentable } from "../../common/types"
import { signalEmitter, SignalEmitter, SIGNALS } from './signal'

export interface Log extends SignalEmitter { }

@signalEmitter
export class Log implements GameEntity, Presentable<Gui.Log>  {
    id: string
    entityType: EntityType = EntityType.LOG

    entries: LogEntry[]

    constructor(config?: Partial<Log>) {
        this.id = `${this.entityType}_${Date.now()}`
        this.entries = config?.entries || []
    }

    addEntry(message: string) {
        const timestamp = format(Date.now(), 'yyyy-MM-dd HH:mm:ss')
        const entry: LogEntry = new LogEntry({ timestamp, message })
        this.entries.push(entry)
        this.sendSignal(this, SIGNALS.LOG_CHANGED, entry)
    }

    toClient(): GameEntity & Gui.Log {
        return {
            id: this.id,
            entityType: this.entityType,
            entries: this.entries.map(e => e.toClient())
        }
    }
}


export class LogEntry implements GameEntity, Presentable<Gui.LogEntry>
{
    id: string
    entityType: EntityType = EntityType.LOG_ENTRY

    timestamp: string
    message: string

    constructor(config: { timestamp: string, message: string }) {
        this.id = `${this.entityType}_${Date.now()}`

        this.timestamp = config.timestamp
        this.message = config.message
    }


    toClient(): GameEntity & Gui.LogEntry {
        return {
            id: this.id,
            entityType: this.entityType,
            timestamp: this.timestamp,
            message: this.message
        }
    }
}