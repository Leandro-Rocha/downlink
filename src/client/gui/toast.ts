import { ToastSeverity } from "../../common/constants.js"
import { Div } from "../lib/html-helper.js"
import { IconType } from "./gui-icon.js"


export class ToastList {

    private toastDiv: Div

    constructor(parent: HTMLElement) {

        this.toastDiv = new Div({ parent })
            .addClass('toast-div')
            .addClass('center-h')
    }

    newToast(message: string, severity: ToastSeverity) {
        const toast = this.toastDiv.div
            .addClass('toast')
            .addClass('show')
            .addClass(severity)


        toast.span.text(message)

        toast.icon
            .code(IconType.close)
            .addClass('toast-close')
            .onClick(() => this.dismiss(toast))


        setTimeout(() => {
            this.dismiss(toast)
        }, 3000);

    }

    private dismiss(toast: Div) {
        toast.addClass('dismiss')

        setTimeout(() => {
            toast.element.remove()
        }, 480);
    }


}