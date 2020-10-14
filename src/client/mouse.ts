

export class Mouse {
    static startingX: number
    static startingY: number
    static draggingObject: any

    static startDragging(e: MouseEvent, moveHandler: (e: MouseEvent) => void, moveEndCallback?: Function) {
        e.preventDefault()

        Mouse.startingX = e.offsetX
        Mouse.startingY = e.offsetY

        document.addEventListener("mousemove", moveHandler, false)

        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", moveHandler, false)
            if (moveEndCallback) moveEndCallback()

        }, false)
    }
}


