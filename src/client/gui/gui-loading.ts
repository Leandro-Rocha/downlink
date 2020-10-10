import { createIcon, IconType } from "./gui-icon.js"

export const guiLoadingScreen = document.createElement('div')
guiLoadingScreen.classList.add('fullScreen')
document.body.appendChild(guiLoadingScreen)


const spinnerDiv = document.createElement('div')
spinnerDiv.classList.add('centerHV')
spinnerDiv.style.textAlign = 'center'
guiLoadingScreen.appendChild(spinnerDiv)

const spinner = createIcon(IconType.spin2)
spinner.classList.add('loadingIcon')
spinner.classList.add('animate-spin')
spinnerDiv.appendChild(spinner)
