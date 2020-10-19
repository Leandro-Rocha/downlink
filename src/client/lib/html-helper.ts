import { IconType } from "../gui/gui-icon"

export abstract class Element {
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

    toggleClass(newClass: string) {
        this.element.classList.toggle(newClass)
        return this
    }

    onClick(action: (event: MouseEvent) => void) {
        this.element.addEventListener('click', action)
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


export abstract class Container extends Element {

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

    get icon() {
        const newElement = new Icon()
        this.element.appendChild(newElement.element)
        return newElement
    }

    get input() {
        const input = new Input()
        this.element.appendChild(input.element)
        return input
    }

    get p() {
        const newElement = new Paragraph()
        this.element.appendChild(newElement.element)
        return newElement
    }

    get ul() {
        const newElement = new UnorderedList()
        this.element.appendChild(newElement.element)
        return newElement
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

    get br() {
        this.element.appendChild(document.createElement('br'))
        return this
    }


}

export class Button extends Element {
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

export class Paragraph extends Element {
    element!: HTMLParagraphElement
    createElement() { this.element = document.createElement('p') }
}

export class Table extends Element {
    element!: HTMLTableElement
    createElement() { this.element = document.createElement('table') }

    private _header?: TableHead
    private _body?: TableBody


    get header(): TableHead {
        if (!this._header) this._header = new TableHead()

        this.element.appendChild(this._header.element)
        return this._header
    }

    get body(): TableBody {
        if (!this._body) this._body = new TableBody()

        this.element.appendChild(this._body.element)
        return this._body
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
        const td = new TableCell(this)
        this.element.appendChild(td.element)
        return td
    }
}

class TableCell extends Container {
    element!: HTMLTableDataCellElement
    createElement() { this.element = document.createElement('td') }

    constructor(public parentRow: TableRow) {
        super()
        this.element = document.createElement('td')
    }

    get td() {
        return this.parentRow.td
    }
}


export class Span extends Element {
    element!: HTMLSpanElement
    createElement() { this.element = document.createElement('span') }
}

export class UnorderedList extends Element {
    element!: HTMLUListElement
    createElement() { this.element = document.createElement('ul') }

    get li() {
        const li = new ListItem(this)
        this.element.appendChild(li.element)
        return li
    }
}

export class ListItem extends Container {
    element!: HTMLLIElement
    createElement() { this.element = document.createElement('li') }

    constructor(public parentList: UnorderedList) {
        super()
    }

    get li() {
        return this.parentList.li
    }
}

export class Icon extends Element {
    element!: HTMLElement

    createElement() {
        this.element = document.createElement('i')
        this.addClass('fa')
    }

    code(code: IconType) {
        this.addClass(code)
        return this
    }
}