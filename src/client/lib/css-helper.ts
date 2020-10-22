import { PropertiesHyphen } from 'csstype'

const headStyle = document.createElement("style");
document.head.appendChild(headStyle);


export function addCssRule(selector: string, style: PropertiesHyphen) {
    headStyle.sheet!.addRule(selector, convertToCssString(style))
}

function convertToCssString(style: PropertiesHyphen) {
    return Object.entries(style).map(e => e[0] + ':' + e[1]).join(';')
}
