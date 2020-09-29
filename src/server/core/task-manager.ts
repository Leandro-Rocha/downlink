import { SoftwareTypes } from '../../common/constants';
import { Types } from '../../common/types'
import { Process, WorkerProcess } from './process';
import { SignalEmitter, signalEmitter, SIGNALS } from './signal';
import { PasswordCrackerProcess } from './software/password-cracker';

export function createProcess(type: SoftwareTypes, data: any) {
    if (type === SoftwareTypes.CRACKER) {
        return new PasswordCrackerProcess(data)
    }

    throw {}//TODO:
}

export interface TaskManager extends SignalEmitter { }
@signalEmitter
export class TaskManager implements Types.TaskManager {

    daemons: Process[]
    processes: WorkerProcess[]

    constructor(config?: Partial<Types.TaskManager>) {
        this.daemons = config?.daemons?.map(p => createProcess(p.type, p)) || [] //TODO:implement

        this.processes = config?.processes?.map(p => createProcess(p.type, p)) || []
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

    toClient(): Partial<Types.TaskManager> {
        return <Partial<Types.TaskManager>>{
            daemons: [],
            processes: this.processes.map(p => p.toClient())
        }
    }
}
