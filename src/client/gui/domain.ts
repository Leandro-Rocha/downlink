import { Gui } from "../../common/types.js"
import { Div } from "../lib/html-helper.js"
import { StateAware } from "./gui-game-state.js"
import { Icon, IconType } from "./gui-icon.js"
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
    navElement: Div
    menuElement: HTMLUListElement
    hostname: Div
    dockIcon: Icon

    constructor(domain: DomainType) {

        const domainClass = `${domain.toLowerCase()}`

        this.navElement = new Div()
        this.navElement.id(`${domainClass}Nav`)
        this.navElement.addClass('sideNav')
        this.navElement.addClass(domainClass)
        guiContainer.appendChild(this.navElement.element)

        this.hostname = this.navElement.div
        this.hostname.addClass('hostname')
        this.hostname.addClass('hidden')

        this.menuElement = document.createElement('ul')
        this.navElement.element.appendChild(this.menuElement)


        if (domain === DomainType.LOCAL)
            this.dockIcon = new Icon(IconType.toggleLeft)
        else
            this.dockIcon = new Icon(IconType.toggleRight)

        this.navElement.element.appendChild(this.dockIcon.element)
        this.dockIcon.addClass(domainClass)
        this.dockIcon.addClass('dock-button')

        this.dockIcon.element.addEventListener('click', () => this.minimize())
    }

    minimize() {
        this.navElement.element.classList.toggle('minimized')
        this.dockIcon.toggleClass(IconType.toggleRight)
        this.dockIcon.toggleClass(IconType.toggleLeft)

    }

    restore() {
        this.navElement.element.classList.toggle('minimized')
        this.dockIcon.toggleClass(IconType.toggleRight)
        this.dockIcon.toggleClass(IconType.toggleLeft)
    }

    updateState(state?: Partial<Gui.Gateway>): void {
        this.hostname.text(state?.hostname || '')

        if (state) {
            this.navElement.removeClass('hidden')
        }
        else {
            this.navElement.addClass('hidden')
        }
    }
}