abstract class Element {
    abstract element: HTMLElement

    id(id: string) {
        this.element.id = id
        return this
    }

    text(text: string) {
        this.element.textContent = text
        return this
    }

    class(newClass: string) {
        this.element.classList.add(newClass)
        return this
    }
}


abstract class Container extends Element {

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


}

class Div extends Container {
    element: HTMLDivElement

    constructor() {
        super()
        this.element = document.createElement('div')
    }
}

class Input extends Element {
    element: HTMLInputElement

    constructor() {
        super()
        this.element = document.createElement('input')
    }

    value(value: string) {
        this.element.value = value
        return this
    }
}


export class Table extends Element {
    element: HTMLTableElement

    #header?: TableHead
    #body?: TableBody

    constructor() {
        super()

        this.element = document.createElement('table')
    }

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
    element: HTMLTableSectionElement

    constructor() {
        super()
        this.element = document.createElement('thead')
    }
}

class TableBody extends TableSection {
    element: HTMLTableSectionElement

    constructor() {
        super()
        this.element = document.createElement('tbody')
    }
}

class TableRow extends Element {
    element: HTMLTableRowElement

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
    element: HTMLTableDataCellElement

    constructor() {
        super()
        this.element = document.createElement('td')
    }
}


