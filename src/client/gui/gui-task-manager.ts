import { Gui } from "../../common/types.js"
import { syncGuiAndDataArray } from "../internals.js"
import { Window, WindowConfig } from "../window.js"
import { StateAware } from "./gui-game-state.js"
import { WorkerProcessGuiElement } from "./gui-worker-process.js"


export class TaskManagerWindow extends Window<Gui.TaskManager> implements StateAware<Gui.TaskManager>{

    processes: WorkerProcessGuiElement[] = []
    taskManagerTable: HTMLTableElement

    constructor(config: WindowConfig) {
        super(config)

        this.taskManagerTable = document.createElement('table')
        this.taskManagerTable.innerHTML = '<thead><td>PID</td><td>progress</td></thead>'

        this.contentElement.appendChild(this.taskManagerTable)
    }

    updateState(state?: Gui.TaskManager): void {
        if (state) {
            syncGuiAndDataArray(state.processes, this.processes, (newElement) => this.taskManagerTable.appendChild(newElement.element))
        }
    }


    getDefaultPosition() {
        return { width: 500 }
    }
}