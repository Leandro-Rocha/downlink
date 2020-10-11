

export interface StateAware<T> {
    updateState(state?: T): void
}