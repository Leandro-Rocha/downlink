export enum IconType {
    server = 'icon-server',
    link = 'icon-link',
    brokenLink = 'icon-unlink',
    login = 'icon-login',
}

export function createIcon(code: IconType): HTMLElement {
    const icon = document.createElement('i')
    icon.classList.add(code)
    return icon
}