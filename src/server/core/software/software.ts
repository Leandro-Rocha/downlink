import { Types } from "../../../common/types"
import { OperationResult } from "../../../shared"
import { Process } from "../process"
import { File } from "../resource"
import { PasswordCrackerProcess } from "./password-cracker"

export type SpawnProcessResult = { process: Process }

export abstract class Software extends File implements Types.Software {
    abstract version: number
    abstract spawnProcess(...args: any[]): OperationResult<SpawnProcessResult>
}

export interface SoftwareTypeMap {
    'CRACKER': PasswordCrackerProcess
    'TRANSFER': PasswordCrackerProcess
}