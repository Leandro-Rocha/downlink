import { EntityType, Presentable, Gui, GameEntity } from '../../common/types'
import { Process, WorkerProcess } from './process';
import { SignalEmitter, signalEmitter, SIGNALS, watcher, Watcher } from './signal';
import { PasswordCrackerProcess } from './software/password-cracker';

export function createProcess(type: EntityType, data: any) {
    if (type === EntityType.PROCESS_CRACKER) {
        return new PasswordCrackerProcess(data)
    }

    throw {}//TODO:
}

export interface TaskManager extends SignalEmitter, Watcher { }
@signalEmitter
@watcher
export class TaskManager implements GameEntity, Presentable<Gui.TaskManager> {
    id: string
    entityType: EntityType = EntityType.TASK_MANAGER

    daemons: Process[]
    processes: WorkerProcess[]

    constructor(config?: Partial<TaskManager>) {
        this.id = config?.id || `TaskManager_${Date.now()}`

        this.daemons = config?.daemons?.map(p => createProcess(p.entityType, p)) || [] //TODO:implement
        this.processes = config?.processes?.map(p => createProcess(p.entityType, p)) || []
    }

    startProcess(process: Process) {

        if (process instanceof WorkerProcess) {
            this.processes.push(process)
        }
        else {
            this.daemons.push(process)
        }

        this.sendSignal(this, SIGNALS.TASK_SCHEDULED, process)

        this.watch(process)
        process.registerHandler(this, SIGNALS.PROCESS_FINISHED, () => this.endProcess(process))
        process.start()
    }

    endProcess(process: Process) {
        if (process instanceof WorkerProcess) {
            this.processes.splice(this.processes.indexOf(process), 1)
        }
        else {
            this.daemons.splice(this.daemons.indexOf(process), 1)
        }

        this.sendSignal(this, SIGNALS.TASK_UNSCHEDULED, process)
    }

    toClient(): GameEntity & Gui.TaskManager {
        return {
            id: this.id,
            entityType: this.entityType,

            daemons: [],
            processes: this.processes.map(p => p.toClient())
        }
    }

}
