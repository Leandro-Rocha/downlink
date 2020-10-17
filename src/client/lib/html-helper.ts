abstract class Element {
    abstract element: HTMLElement

    constructor(options?: { parent?: HTMLElement }) {

        this.createElement()

        if (options?.parent) {
            options.parent.appendChild(this.getElement())
        }
    }

    private getElement() {
        return this.element
    }

    protected abstract createElement(): void


    addClass(...newClass: string[]) {
        this.element.classList.add(...newClass)
        return this
    }

    removeClass(...newClass: string[]) {
        this.element.classList.remove(...newClass)
        return this
    }

    id(id: string) {
        this.element.id = id
        return this
    }

    text(text: string) {
        this.element.textContent = text
        return this
    }
}


abstract class Container extends Element {

    get button() {
        const button = new Button()
        this.element.appendChild(button.element)
        return button
    }

    get div() {
        const div = new Div()
        this.element.appendChild(div.element)
        return div
    }

    get input() {
        const input = new Input()
        this.element.appendChild(input.element)
        return input
    }

    get table() {
        const table = new Table()
        this.element.appendChild(table.element)
        return table
    }

    get span() {
        const span = new Span()
        this.element.appendChild(span.element)
        return span
    }


}

export class Button extends Container {
    element!: HTMLButtonElement
    createElement() { this.element = document.createElement('button') }
}

export class Div extends Container {
    element!: HTMLDivElement
    createElement() { this.element = document.createElement('div') }
}

export class Input extends Element {
    element!: HTMLInputElement
    createElement() { this.element = document.createElement('input') }

    value(value: string) {
        this.element.value = value
        return this
    }
}

export class Table extends Element {
    element!: HTMLTableElement
    createElement() { this.element = document.createElement('table') }

    #header?: TableHead
    #body?: TableBody


    get header(): TableHead {
        if (!this.#header) this.#header = new TableHead()

        this.element.appendChild(this.#header.element)
        return this.#header
    }

    get body(): TableBody {
        if (!this.#body) this.#body = new TableBody()

        this.element.appendChild(this.#body.element)
        return this.#body
    }

}

abstract class TableSection extends Element {

    get tr() {
        const tr = new TableRow()
        this.element.appendChild(tr.element)
        return tr
    }
}

class TableHead extends TableSection {
    element!: HTMLTableSectionElement
    createElement() { this.element = document.createElement('thead') }
}

class TableBody extends TableSection {
    element!: HTMLTableSectionElement
    createElement() { this.element = document.createElement('tbody') }
}

export class TableRow extends Element {
    element!: HTMLTableRowElement
    createElement() { this.element = document.createElement('tr') }

    constructor() {
        super()
        this.element = document.createElement('tr')
    }

    get td() {
        const td = new TableCell()
        this.element.appendChild(td.element)
        return td
    }
}

class TableCell extends Container {
    element!: HTMLTableDataCellElement
    createElement() { this.element = document.createElement('td') }

    constructor() {
        super()
        this.element = document.createElement('td')
    }
}


export class Span extends Container {
    element!: HTMLSpanElement
    createElement() { this.element = document.createElement('span') }
}