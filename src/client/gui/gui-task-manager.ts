import { Gui } from "../../common/types.js"
import { Window, WindowConfig } from "../window.js"
import { WorkerProcessGuiElement } from "./gui-worker-process.js"


export class TaskManagerWindow extends Window<Gui.TaskManager> {

    processes: WorkerProcessGuiElement[] = []
    taskManagerTable: HTMLTableElement

    constructor(config: WindowConfig) {
        super(config)

        this.taskManagerTable = document.createElement('table')
        this.taskManagerTable.innerHTML = '<thead><td>PID</td><td>progress</td></thead>'

        this.contentElement.appendChild(this.taskManagerTable)
    }

    updateContent(data: Gui.TaskManager): void {
        this.syncGuiAndData(data.processes, this.processes, (newElement) => this.taskManagerTable.appendChild(newElement.element))
    }

    getDefaultPosition() {
        return { width: 500 }
    }
}