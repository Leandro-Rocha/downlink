import { ROOT } from "../../../common/constants";
import { EntityType, Gui } from "../../../common/types";
import { OperationResult } from "../../../shared";
import { GatewayStore } from "../../../storage/gateway-store";
import { getCurrentPlayer } from "../game-state";
import { WorkerProcessConstructor, WorkerProcess } from "../process";
import { signalEmitter, SIGNALS } from "../signal";
import { Software, SpawnProcessResult } from "./software";





export class NetworkScanner extends Software {
    version: number


    constructor(config?: Partial<NetworkScanner>) {
        super(config)

        this.version = config?.version || 1.0
        this.name = config?.name || `NetworkScanner[v${this.version}]`
        this.size = config?.size || 1000
    }


    spawnProcess(): OperationResult<SpawnProcessResult> {
        const result = new OperationResult<SpawnProcessResult>()

        //TODO: implement dynamic parameters based on password strength
        const process = new NetworkScannerProcess({
            totalWork: 10000,
        })


        result.details = { process: process }
        return result
    }
}



@signalEmitter
export class NetworkScannerProcess extends WorkerProcess {
    id: string
    entityType: EntityType = EntityType.PROCESS_NETWORK_SCANNER
    shortName: string
    description: string

    private interval!: NodeJS.Timeout

    constructor(config: WorkerProcessConstructor) {
        super(config)

        this.shortName = 'NETSCN'
        this.description = `Scanning network for vulnerable systems`

        this.id = config.id || this.pidGenerator()
    }

    start() {
        super.start()
        const hackedDB = getCurrentPlayer().hackedDB

        const unknownGateways = GatewayStore.getAll().filter(g => !hackedDB.entries.some(entry => entry.ip === g.ip))

        const updateInterval = this.totalWork / (unknownGateways.length || 1)


        var found = 0
        this.interval = setInterval(() => {
            this.checkStatus()

            const currentScanned = unknownGateways[found++]

            if (currentScanned) {
                // Already exists in HackedDB
                if (hackedDB.entries.some(e => e.ip === currentScanned.ip)) return

                hackedDB.addEntry(currentScanned, { userName: ROOT, password: '', partial: true })
                this.sendSignal(this, SIGNALS.PROCESS_UPDATED)
            }

            if (found >= unknownGateways.length) {
                this.finish()
            }

        }, updateInterval)
    }

    finish() {
        clearInterval(this.interval)
        super.finish()
    }
}