import { Icon, IconType } from "./gui-icon.js"

export const guiLoadingScreen = document.createElement('div')
guiLoadingScreen.classList.add('fullScreen')
document.body.appendChild(guiLoadingScreen)


const spinnerDiv = document.createElement('div')
spinnerDiv.classList.add('centerHV')
spinnerDiv.style.textAlign = 'center'
guiLoadingScreen.appendChild(spinnerDiv)

const spinner = new Icon(IconType.circleNotch).element
spinner.classList.add('loadingIcon')
spinner.classList.add('fa-spin')
spinnerDiv.appendChild(spinner)
