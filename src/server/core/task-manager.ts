import { Types } from '../../common/types'
import { Process } from './process';
import { SignalEmitter, signalEmitter, SIGNALS } from './signal';
import { PasswordCrackerProcess } from './software/password-cracker';


export interface TaskManager extends SignalEmitter { }
@signalEmitter
export class TaskManager implements Types.TaskManager {

    permanentProcesses: Process[]
    workerProcesses: PasswordCrackerProcess[]

    constructor(config?: Partial<Types.TaskManager>) {
        this.permanentProcesses = []//TODO:implement

        this.workerProcesses = config?.workerProcesses?.map(p => new PasswordCrackerProcess(p)) || []
    }


    startProcess(process: Process) {

        if (process instanceof PasswordCrackerProcess) {
            this.workerProcesses.push(process)
        }
        else {
            this.permanentProcesses.push(process)
        }

        this.sendSignal(this, SIGNALS.TASK_SCHEDULED, process)

        process.registerHandler(this, SIGNALS.PROCESS_FINISHED, () => this.endProcess(process))
        process.start()
    }

    endProcess(process: Process) {
        if (process instanceof PasswordCrackerProcess) {
            this.workerProcesses.splice(this.workerProcesses.indexOf(process), 1)
        }
        else {
            this.permanentProcesses.splice(this.permanentProcesses.indexOf(process), 1)
        }

        this.sendSignal(this, SIGNALS.TASK_UNSCHEDULED, process)
    }

    toClient(): Partial<Types.TaskManager> {
        return <Partial<Types.TaskManager>>{
            permanentProcesses: [],
            workerProcesses: this.workerProcesses.map(p => p.toClient())
        }
    }
}
