import { EntityType, Gui } from "../../common/types.js"
import { GuiElement } from "./gui-base.js"
import { PasswordCrackerGuiElement } from "./gui-password-cracker.js"


export class WorkerProcessGuiElement extends GuiElement<Gui.WorkerProcess>{
    element: HTMLTableRowElement

    pidElement: HTMLElement
    progressElement: HTMLElement
    priorityElement: HTMLTableDataCellElement

    progressInterval?: NodeJS.Timeout
    effectInterval?: NodeJS.Timeout

    constructor() {
        super()
        this.element = document.createElement('tr')
        this.pidElement = this.element.appendChild(document.createElement('td'))
        this.progressElement = this.element.appendChild(document.createElement('td'))
        this.priorityElement = this.element.appendChild(document.createElement('td'))
    }

    destroy() {
        if (this.progressInterval !== undefined) clearInterval(this.progressInterval)
        if (this.effectInterval !== undefined) clearInterval(this.effectInterval)
        super.destroy()
    }

    updateContent(data: Gui.WorkerProcess): void {
        this.data = data
        this.pidElement.textContent = this.data.id
        this.priorityElement.textContent = this.data.priority.toString()

        const totalWork = this.data.totalWork
        var workDone = this.data.workDone

        if (this.progressInterval) clearInterval(this.progressInterval)
        if (this.effectInterval) clearInterval(this.effectInterval)

        this.progressInterval = setInterval(() => {

            workDone += 1000 / 30
            const percentDone = Math.min(Math.round(workDone / totalWork * 100), 100)
            this.progressElement.textContent = `${percentDone}%`

        }, 1000 / 30)

        const effect = getEffect(this.data.entityType)
        if (effect) this.effectInterval = effect()

        // this.progressElement.textContent = `${Math.round(workDone / totalWork * 100)}%`
    }
}

function getEffect(type: EntityType) {
    if (type === EntityType.PROCESS_CRACKER) {
        return PasswordCrackerGuiElement.effect
    }
}