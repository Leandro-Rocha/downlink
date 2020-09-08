import { Process } from "./core/process"



// export class GameLoop {
//     processes: Process[] = []
//     startTime: number = 0
//     lastUpdate: number = 0
//     interval: any = undefined


//     start() {
//         var now = Date.now()
//         var elapsed = now

//         this.startTime = now
//         this.lastUpdate = now

//         this.interval = setInterval(() => {
//             now = Date.now()
//             elapsed = now - this.lastUpdate
//             this.lastUpdate = now

//             this.processes
//                 .filter(p => p.status === Status.RUNNING)
//                 .forEach(p => p.makeProgress(elapsed))

//             if (this.processes.filter(p => p.status != Status.DEAD).length == 0) {
//                 console.log('FINISHED');
//                 clearInterval(this.interval)
//             }
//         }, 1)


//     }


// }