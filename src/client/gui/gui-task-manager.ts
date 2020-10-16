import { Gui } from "../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../desktop-window.js"
import { syncGuiAndDataArray } from "../internals.js"
import { Table } from "../lib/html-helper.js"
import { StateAware } from "./gui-game-state.js"
import { WorkerProcessGuiElement } from "./gui-worker-process.js"


export class TaskManagerWindow extends DesktopWindow implements StateAware<Gui.TaskManager>{

    processes: WorkerProcessGuiElement[] = []
    taskManagerTable: HTMLTableElement
    taskManagerTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-task-manager'])

        const table = new Table()
        this.contentElement.appendChild(table.element)

        const headerRow = table.header.tr
        headerRow.td.text('PID').class('pid-header')
        headerRow.td.text('%').class('progress-header')
        headerRow.td.text('Priority')
        headerRow.td.text('CPU').class('cpu-header')
        headerRow.td.text('Mem').class('mem-header')

        this.taskManagerTable = table.element
        this.taskManagerTableBody = table.body.element
    }

    updateState(state?: Gui.TaskManager): void {
        syncGuiAndDataArray(state?.processes || [], this.processes, (newElement) => this.taskManagerTableBody.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}

