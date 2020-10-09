
data = {
    local: {
        ip: 123,
        hostName: 'alze',
        connection: {
            status: 'connected',
            hacked: true
        }
    },
    remote: {
        type: 'gateway',
        ip: 543,
    }
}

class Watcher {
    constructor(expression) {
        this.expression = expression
    }
}

watcher1 = new Watcher('>local>connection>hacked')
watcher2 = new Watcher('>remote>ip')

watchers = [watcher1, watcher2]

function printJsonPath(json, path = '') {
    if (typeof json != "object") return

    Object.keys(json).forEach(key => {
        const jsonPath = `${path}>${key}`

        if (typeof json[key] === "object") {
            printJsonPath(json[key], jsonPath)
        }
        else {
            // console.log(jsonPath)
            watchers.forEach(w => {
                if (w.expression === jsonPath) {
                    w.value = json[key]
                }
            })
        }
    })
}

printJsonPath(data)
watchers.forEach(w => {
    console.log(w.value)
})

data.remote.ip = 123
data.local.connection.hacked = false

printJsonPath(data)
watchers.forEach(w => {
    console.log(w.value)
})