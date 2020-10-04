import { format } from 'date-fns'
import { EntityType, GameEntity, Gui, Presentable } from "../../common/types"
import { signalEmitter, SignalEmitter, SIGNALS } from './signal'

export interface Log extends SignalEmitter { }

@signalEmitter
export class Log implements GameEntity, Presentable<Gui.Log>  {
    id: string
    entityType: EntityType = EntityType.LOG

    entries: Gui.LogEntry[]

    constructor(config?: Partial<Log>) {
        this.id = `${this.entityType}_${Date.now()}`
        this.entries = config?.entries || []
    }

    addEntry(message: string) {
        const timestamp = format(Date.now(), 'yyyy-MM-dd HH:mm:ss.SSS')
        const entry: Gui.LogEntry = { timestamp, message }
        this.entries.push(entry)
        this.sendSignal(this, SIGNALS.LOG_CHANGED, entry)
    }

    toClient(): GameEntity & Gui.Log {
        return {
            id: this.id,
            entityType: this.entityType,
            entries: this.entries
        }
    }
}
