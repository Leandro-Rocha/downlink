import { Gui } from "../../../common/types.js"
import { DesktopWindow, DesktopWindowConfig } from "../../desktop-window.js"
import { syncGuiAndDataArray } from "../../internals.js"
import { StateAware } from "../gui-game-state.js"
import { WorkerProcessGuiElement } from "../gui-worker-process.js"


export class TaskManagerWindow extends DesktopWindow implements StateAware<Gui.TaskManager>{

    processes: WorkerProcessGuiElement[] = []
    taskManagerTable: HTMLTableElement
    taskManagerTableBody: HTMLTableSectionElement

    constructor(config: DesktopWindowConfig) {
        super(config, ['window-task-manager'])

        const table = this.content.table

        const headerRow = table.header.tr
        headerRow.td.text('PID').addClass('pid-header')
        headerRow.td.text('%').addClass('progress-header')
        headerRow.td.text('Priority')
        headerRow.td.text('CPU').addClass('cpu-header')
        headerRow.td.text('Mem').addClass('mem-header')

        this.taskManagerTable = table.element
        this.taskManagerTableBody = table.body.element
    }

    updateState(state?: Gui.TaskManager): void {
        syncGuiAndDataArray(state?.processes || [], this.processes, (newElement) => this.taskManagerTableBody.appendChild(newElement.element))

        if (state) this.show()
        else this.hide()
    }
}

