import { Gui } from "../../../common/types"
import { OperationResult } from "../../../shared"
import { Process } from "../process"
import { File } from "../resource"

export type SpawnProcessResult = { process: Process }

export abstract class Software extends File implements Gui.Software {
    abstract version: number
    abstract spawnProcess(...args: any[]): OperationResult<SpawnProcessResult>
}
