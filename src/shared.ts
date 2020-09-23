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

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name]
        })
    })
}

export function generateIp() {
    return (Math.floor(Math.random() * 255) + 1)
        + "." + (Math.floor(Math.random() * 255))
        + "." + (Math.floor(Math.random() * 255))
        + "." + (Math.floor(Math.random() * 255))
}