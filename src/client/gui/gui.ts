import { FileManagerWindow } from "./window/file-manager-window.js"
import { NetworkWindow } from "./window/network-window.js"
import { LogWindow } from "./window/log-window.js"
import { Domain, DomainType } from "./domain.js"
import { TaskManagerWindow } from "./window/task-manager-window.js"
import { ConnectionWindow } from "./gui-connection.js"
import { GuiHeader } from "./gui-header.js"
import { GuiRegister } from "./gui-register.js"
import { LoginWindow } from "./window/login-window.js"

export const guiContainer = document.createElement('div')
guiContainer.classList.add('fullScreen')
guiContainer.classList.add('hidden')
document.body.appendChild(guiContainer)

export const guiHeader = new GuiHeader()
export const guiRegister = new GuiRegister()

export const localDomain = new Domain(DomainType.LOCAL)
export const hackedDBWindow = new NetworkWindow({ id: 'network', title: 'Network', domain: localDomain })
export const localLogWindow = new LogWindow({ id: 'local-log', title: 'Local Log', domain: localDomain })
export const localFileManagerWindow = new FileManagerWindow({ id: 'local-file-manager', title: 'File Manager', domain: localDomain })
export const taskManagerWindow = new TaskManagerWindow({ id: 'task-manager', title: 'Task Manager', domain: localDomain })


export const remoteDomain = new Domain(DomainType.REMOTE)
export const loginWindow = new LoginWindow({ id: 'remote-login', title: 'Login', domain: remoteDomain })
export const remoteLogWindow = new LogWindow({ id: 'remote-log', title: 'Remote Log', domain: remoteDomain })
export const remoteFileManagerWindow = new FileManagerWindow({ id: 'remote-file-manager', title: 'File Manager', domain: remoteDomain })

export const connectionWindow = new ConnectionWindow()

