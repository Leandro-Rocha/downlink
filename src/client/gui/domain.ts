import { Gui } from "../../common/types.js"
import { StateAware } from "./gui-game-state.js"
import { guiContainer } from "./gui.js"

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

class SideNav implements StateAware<{ hostname?: string }>{
    navElement: HTMLDivElement
    menuElement: HTMLUListElement
    hostname: HTMLDivElement

    constructor(domain: DomainType) {

        this.navElement = document.createElement('div')
        this.navElement.id = `${domain.toLowerCase()}Nav`
        this.navElement.classList.add('sideNav')
        guiContainer.appendChild(this.navElement)

        this.hostname = document.createElement('div')
        this.hostname.classList.add('hostname')
        this.navElement.appendChild(this.hostname)

        this.menuElement = document.createElement('ul')
        this.navElement.appendChild(this.menuElement)
    }

    updateState(state?: Partial<Gui.Gateway>): void {
        this.hostname.innerText = state?.hostname || ''

        if (state) {
            this.navElement.classList.remove('hidden')
        }
        else{
            this.navElement.classList.add('hidden')
        }
    }
}