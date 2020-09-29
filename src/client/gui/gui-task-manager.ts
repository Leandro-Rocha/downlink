import { Gui } from "../../common/types.js"
import { Window, WindowConfig } from "../window.js"
import { GuiElement, syncGuiAndData } from "./gui-base.js"


export class TaskManagerWindow extends Window<Gui.TaskManager> {

    processes: WorkerProcessGuiElement[] = []
    taskManagerTable: HTMLTableElement

    constructor(config: WindowConfig) {
        super(config)

        // this.contentElement.innerHTML = ''
        this.taskManagerTable = document.createElement('table')
        this.contentElement.appendChild(this.taskManagerTable)
        this.taskManagerTable.querySelectorAll('tr').forEach(c => c.remove())
        this.taskManagerTable.innerHTML = '<thead><td>PID</td><td>progress</td></thead>'
    }

    updateContent(data: Gui.TaskManager): void {
        syncGuiAndData(this.taskManagerTable, data.processes, this.processes)
    }
}

export class WorkerProcessGuiElement extends GuiElement<Gui.WorkerProcess>{
    element: HTMLElement

    constructor(data: Gui.WorkerProcess) {
        super(data)

        this.element = document.createElement('tr')
    }

    updateContent(data?: Gui.WorkerProcess): void {
        if (data !== undefined) {
            this.data = data
        }

        const pidElement = this.element.appendChild(document.createElement('td'))
        const progressElement = this.element.appendChild(document.createElement('td'))

        pidElement.textContent = this.data.gameId

        var workDone = this.data.workDone!
        var totalWork = this.data.totalWork

        // setInterval(() => {
        //     workDone += 1000 / 30
        //     console.log(`TaskManagerWindow -> updateContent -> workDone`, workDone)
        //     progressElement.textContent = `${Math.round(workDone / totalWork * 100)}%`

        // }, 1000 / 30)
    }
}