export function getNumber(input?: string): number | undefined {
    if (input === undefined) return
    if (input.length === 0) return

    const match = input.match(/\d+/g)
    if (match === null) return

    return parseInt(match.join())

}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name]
        })
    })
}