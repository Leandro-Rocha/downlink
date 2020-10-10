import { guiBase } from "./gui.js"

export enum DomainType {
    LOCAL = 'LOCAL',
    REMOTE = 'REMOTE',
    CONNECTION = 'CONNECTION',
}

export class Domain {
    type: DomainType
    cssClass: string
    navigation: SideNav

    constructor(type: DomainType) {
        this.type = type
        this.cssClass = type.toLowerCase()
        this.navigation = new SideNav(type)
    }
}

class SideNav {
    navElement: HTMLDivElement
    menuElement: HTMLUListElement
    hostname: HTMLDivElement

    constructor(domain: DomainType) {

        this.navElement = document.createElement('div')
        this.navElement.id = `${domain.toLowerCase()}Nav`
        this.navElement.classList.add('sideNav')
        guiBase.appendChild(this.navElement)

        this.hostname = document.createElement('div')
        this.hostname.classList.add('hostname')
        this.navElement.appendChild(this.hostname)

        this.menuElement = document.createElement('ul')
        this.navElement.appendChild(this.menuElement)
    }

    updateContent(data: { hostname: string }): void {
        this.hostname.innerText = data.hostname
    }
}