import { WorkerProcess } from "./process";
import { SIGNALS } from "./signal";


export namespace Worker {

    const processes: WorkerProcess[] = []
    var lastUpdate = Date.now()

    export function addProcess(process: WorkerProcess) {
        console.log(`Adding [${process.pid}] to worker list`)
        processes.push(process)
    }

    export function removeProcess(process: WorkerProcess) {
        console.log(`Removing [${process.pid}] to worker list`)
        processes.splice(processes.indexOf(process), 1)
    }


    setInterval(() => {
        const now = Date.now()
        const elapsed = now - lastUpdate
        lastUpdate = now

        processes.forEach(p => {
            p.doWork!(elapsed)

            if (p.workDone >= p.totalWork) {
                p.finish()
            }
            p.sendSignal(p, SIGNALS.PROCESS_UPDATED)
        })

    }, 100)
}




