import { EntityType, Presentable, Gui } from '../../common/types'
import { Process, WorkerProcess } from './process';
import { SignalEmitter, signalEmitter, SIGNALS } from './signal';
import { PasswordCrackerProcess } from './software/password-cracker';

export function createProcess(type: EntityType, data: any) {
    if (type === EntityType.PROCESS_CRACKER) {
        return new PasswordCrackerProcess(data)
    }

    throw {}//TODO:
}

export interface TaskManager extends SignalEmitter { }
@signalEmitter
export class TaskManager implements Presentable<Gui.TaskManager> {

    daemons: Process[]
    processes: WorkerProcess[]

    constructor(config?: Partial<Gui.TaskManager>) {
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

    toClient(): Partial<Gui.TaskManager> {
        return <Partial<Gui.TaskManager>>{
            daemons: [],
            processes: this.processes.map(p => p.toClient())
        }
    }
}
