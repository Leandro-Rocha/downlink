export enum OperationStatus {
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
}

export class OperationResult<T> {
    private result: OperationStatus = OperationStatus.SUCCESS
    messages: string[] = []
    details!: T

    assert(condition: boolean, message: string) {
        if (!condition) {
            this.result = OperationStatus.FAIL
            this.messages.push(message)
        }
    }

    isSuccessful() {
        return this.result === OperationStatus.SUCCESS
    }
}

export class Validator {
    static assert(condition: boolean, message: string) {
        if (!condition) {
            console.error(message)
            throw new Error(message)
        }
    }
}

export function generateIp() {
    return (Math.floor(Math.random() * 255) + 1)
        + "." + (Math.floor(Math.random() * 255))
        + "." + (Math.floor(Math.random() * 255))
        + "." + (Math.floor(Math.random() * 255))
}