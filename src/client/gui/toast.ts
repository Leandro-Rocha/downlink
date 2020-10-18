import { guiContainer } from "./gui"


export enum ToastSeverity {
    INFO,
    ERROR
}


export class Toast {

    static toastList: Toast[] = []

    constructor(public message: string, public severity: ToastSeverity) {
        Toast.toastList.push(this)
    }

    render() {
        guiContainer.appendChild
    }

}