import { Gui } from "../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../desktop-window.js"
import { syncGuiAndDataArray } from "../internals.js"
import { TableHelper } from "../lib/table-helper.js"
import { StateAware } from "./gui-game-state.js"
import { WorkerProcessGuiElement } from "./gui-worker-process.js"


export class TaskManagerWindow extends DesktopWindow implements StateAware<Gui.TaskManager>{

    processes: WorkerProcessGuiElement[] = []
    taskManagerTable: HTMLTableElement
    taskManagerTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config)

        const table = new TableHelper(this.contentElement)

        table.header.tr
            .td.text('PID')
            .td.text('Progress').class('progress-header')

        this.taskManagerTable = table.element
        this.taskManagerTableBody = table.body.element
    }

    updateState(state?: Gui.TaskManager): void {
        syncGuiAndDataArray(state?.processes || [], this.processes, (newElement) => this.taskManagerTableBody.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}

