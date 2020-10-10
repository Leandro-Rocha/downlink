import { FileManagerWindow } from "./gui-file-manager.js"
import { HackedDbWindow } from "./gui-hacked-db.js"
import { LogWindow } from "./gui-log.js"
import { Domain, DomainType } from "./domain.js"
import { TaskManagerWindow } from "./gui-task-manager.js"
import { ConnectionWindow } from "./gui-connection.js"
import { GuiHeader } from "./gui-header.js"
import { GuiRegister } from "./gui-register.js"

export const guiContainer = document.createElement('div')
guiContainer.classList.add('fullScreen')
document.body.appendChild(guiContainer)

export const guiHeader = new GuiHeader()
export const guiRegister = new GuiRegister()

export const localDomain = new Domain(DomainType.LOCAL)
export const localLog = new LogWindow({ id: 'local-log', title: 'Local Log', domain: localDomain })
export const localFileManagerWindow = new FileManagerWindow({ id: 'local-file-manager', title: 'File Manager', domain: localDomain })
export const taskManager = new TaskManagerWindow({ id: 'task-manager', title: 'Task Manager', domain: localDomain })
export const hackedDB = new HackedDbWindow({ id: 'hacked-db', title: 'HackedDB', domain: localDomain })


export const remoteDomain = new Domain(DomainType.REMOTE)
export const remoteLog = new LogWindow({ id: 'remote-log', title: 'Remote Log', domain: remoteDomain })
export const remoteFileManagerWindow = new FileManagerWindow({ id: 'remote-file-manager', title: 'File Manager', domain: remoteDomain })

export const connectionWindow = new ConnectionWindow()