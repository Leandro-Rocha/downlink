import { MyType } from '../common/types'

const socket = io()

socket.on('dataUpdate', data => {
    gateways = data
    console.log('Welcome ', data)

    renderNetwork()
})

const test = new MyType()


function resetData() {
    socket.emit('reset-data')
    resetLines()
}

const GATEWAY_SIZE = 100
let gateways = []
var global_closest
var global_oldSelected = gateways.find(g => g.selected)
var global_newSelected
const bounceInput = document.getElementById('bounce')
let bounceArray = []
const body = document.getElementsByTagName("body")[0];

function drawGateway(gateway) {

    var outerButton = document.createElement("div");
    var button = document.createElement("div");
    outerButton.appendChild(button)

    outerButton.classList.add('round-button')


    button.innerHTML = `<a  class="round-button">${gateway.owner}</a>`
    button.classList.add('round-button-circle')


    body.appendChild(outerButton)

    button.addEventListener("click", function () {
        if (bounceArray.includes(gateway)) return

        bounceArray.push(gateway)
        drawBounce()
        bounceInput.value = bounceArray.map(g => g.owner)
        console.log(bounceArray)
    })

    outerButton.style.display = `block`
    outerButton.style.height = `${GATEWAY_SIZE}px`
    outerButton.style.width = `${GATEWAY_SIZE}px`
    outerButton.style.position = `absolute`
    outerButton.style.left = `${gateway.meta.x}px`
    outerButton.style.top = `${gateway.meta.y}px`
    outerButton.style.marginLeft = `-${GATEWAY_SIZE / 2}px`
    outerButton.style.marginTop = `-${GATEWAY_SIZE / 2}px`

}

function drawCircle(x, y, radius, color) {
    const ctx = canvas.getContext("2d");
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    ctx.stroke()
}

function registerUser() {

    const userName = document.getElementById('userName').value


    socket.emit('user register', { user: userName })
}

function renderNetwork() {
    gateways.forEach(g => drawGateway(g))

    const processes = gateways
        .filter(g => g.processes.length > 0)
        .reduce((processes, g) => processes = [...processes, ...g.processes], [])

    processes.forEach(p => drawTransfer(p))
}

function getGatewayByIp(ip) {
    return gateways.find(g => g.ip === ip)
}

function drawTransfer(p) {
    const from = getGatewayByIp(p.local)
    const to = getGatewayByIp(p.remote)

    const line = createLineElement(from.meta.x, from.meta.y, to.meta.x, to.meta.y)
    line.classList.add('bounce')
    line.classList.add(p.type)
    line.innerText = `${p.bandWidth}`
    var body = document.getElementsByTagName("body")[0]
    body.appendChild(line)
}



function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function radToDeg(rad) {
    return rad / (Math.PI / 180);
}


function drawBounce() {
    let path = [...bounceArray]

    while (path.length > 1) {
        const from = path.shift()
        const to = path[0]

        const line = createLineElement(from.meta.x, from.meta.y, to.meta.x, to.meta.y)
        line.classList.add('bounce')
        line.innerText = `${from.owner}-${to.owner}`
        var body = document.getElementsByTagName("body")[0]
        body.appendChild(line)
    }
}

function resetBounce() {
    bounceArray = []
    removeElements(document.querySelectorAll(".bounce"))
    bounceInput.value = ''
    drawBounce()
}

function resetLines() {
    bounceArray = []
    removeElements(document.querySelectorAll(".line"))
    bounceInput.value = ''
    drawBounce()
}

function removeElements(elms) { elms.forEach(el => el.remove()) }

function startDownload() {
    socket.emit('start download', bounceArray.map(g => g.ip))
    resetBounce()
}


function createLineElement(x1, y1, x2, y2) {
    const height = x2 - x1
    const base = y2 - y1
    const distance = Math.sqrt(height ** 2 + base ** 2)

    const line = document.createElement("div")
    line.classList.add('line')

    line.style.left = `${x1}px`
    line.style.top = `${y1}px`
    line.style.width = `${distance}px`
    line.style.transform = `rotate(${radToDeg(Math.atan2(base, height))}deg)`

    return line
}




