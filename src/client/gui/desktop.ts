import { DesktopWindow, DesktopWindowConfig } from "../desktop-window"

export class Desktop {

    static windowList: DesktopWindow[] = []

    static bringToFront(window: DesktopWindow) {

        Desktop.windowList.splice(Desktop.windowList.indexOf(window), 1)
        Desktop.windowList.push(window)

        Desktop.windowList.forEach((w, index) => {
            w.zIndex = index + 1
            w.savePosition()
        })
    }

    static saveWindowData(window: DesktopWindowConfig) {
        if (!localStorage.getItem('windowData')) {
            localStorage.setItem('windowData', '{}')
        }

        const windowData: { [key: string]: DesktopWindowConfig } = JSON.parse(localStorage.getItem('windowData')!)
        windowData[window.id] = window

        localStorage.setItem('windowData', JSON.stringify(windowData))
    }

    static getWindowData(id: string): DesktopWindowConfig | undefined {
        if (!localStorage.getItem('windowData')) {
            localStorage.setItem('windowData', '{}')
        }

        const windowData: { [key: string]: DesktopWindowConfig } = JSON.parse(localStorage.getItem('windowData')!)
        return windowData[id] || {}
    }
}