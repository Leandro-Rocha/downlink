import { Gui } from "../../common/types.js"
import { GuiElement } from "./gui-base.js"


export class WorkerProcessGuiElement extends GuiElement<Gui.WorkerProcess>{
    element: HTMLTableRowElement 

    pidElement: HTMLElement
    progressElement: HTMLElement

    progressInterval: NodeJS.Timeout | undefined

    constructor() {
        super()
        this.element = document.createElement('tr')
        this.pidElement = this.element.appendChild(document.createElement('td'))
        this.progressElement = this.element.appendChild(document.createElement('td'))
    }

    destroy() {
        if (this.progressInterval !== undefined) clearInterval(this.progressInterval)
        super.destroy()
    }

    updateContent(data: Gui.WorkerProcess): void {
        this.data = data

        this.pidElement.textContent = this.data.id

        const totalWork = this.data.totalWork
        var workDone = this.data.workDone

        if (this.progressInterval !== undefined) clearInterval(this.progressInterval)

        this.progressInterval = setInterval(() => {

            workDone += 1000 / 30
            const percentDone = Math.min(Math.round(workDone / totalWork * 100), 100)
            this.progressElement.textContent = `${percentDone}%`

        }, 1000 / 30)



        // this.progressElement.textContent = `${Math.round(workDone / totalWork * 100)}%`
    }
}