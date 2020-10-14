
export class TableHelper {
    element: HTMLTableElement

    #header?: TableHead
    #body?: TableBody

    constructor(parent?: HTMLElement) {
        this.element = document.createElement('table')

        if (parent) parent.appendChild(this.element)
    }

    get header(): TableHead {
        if (!this.#header) this.#header = new TableHead

        this.element.appendChild(this.#header.element)
        return this.#header
    }

    get body(): TableBody {
        if (!this.#body) this.#body = new TableBody

        this.element.appendChild(this.#body.element)
        return this.#body
    }

}

class TableHead {
    element: HTMLTableSectionElement

    constructor() {
        this.element = document.createElement('thead')
    }

    get tr() {
        const tr = new TableRow()
        this.element.appendChild(tr.element)
        return tr
    }
}

class TableBody {
    element: HTMLTableSectionElement

    constructor() {
        this.element = document.createElement('tbody')
    }

    get tr() {
        const tr = new TableRow()
        this.element.appendChild(tr.element)
        return tr
    }
}

class TableRow {
    element: HTMLTableRowElement

    constructor() {
        this.element = document.createElement('tr')
    }

    get td() {
        const td = new TableCell(this)
        this.element.appendChild(td.element)
        return td
    }
}

class TableCell {
    element: HTMLTableDataCellElement
    private parentElement: TableRow

    constructor(parentRow: TableRow) {
        this.element = document.createElement('td')
        this.parentElement = parentRow
    }

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

    get td() {
        return this.parentElement.td
    }
}
