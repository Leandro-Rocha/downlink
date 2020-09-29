import { Presentable, Gui } from "../../../common/types"
import { Gateway } from "../gateway"
import faker from "faker";
import { OperationResult } from "../../../shared";


export class User implements Gui.User {
    userName: string
    password: string
    partial: boolean

    constructor(config?: Partial<Gui.User>) {
        this.userName = config?.userName || faker.internet.userName()
        this.password = config?.password !== undefined ? config.password : faker.internet.password()
        this.partial = config?.partial || false
    }
}


export class HackedDbEntry implements Gui.HackedDbEntry, Presentable<Gui.HackedDbEntry> {
    guiId: string
    ip: string
    users: User[]

    constructor(config: Partial<HackedDbEntry>) {
        this.guiId = config.guiId || ''
        this.ip = config.ip || ''
        this.users = config.users || []
    }

    toClient(): Partial<Gui.HackedDbEntry> {
        return {
            ip: this.ip,
            users: this.users
        }
    }
}

export class HackedDB implements Gui.HackedDB, Presentable<Gui.HackedDB> {
    entries: HackedDbEntry[]

    constructor(config?: Partial<Gui.HackedDB>) {
        this.entries = config?.entries?.map(e => new HackedDbEntry(e)) || []
    }

    getEntryById(id: string) {
        return this.entries.find(e => e.guiId === id)
    }

    addEntry(remoteGateway: Gateway, paramUser: Gui.User) {
        const result = new OperationResult<{ entry: Gui.HackedDbEntry }>()
        const existingUser = remoteGateway.getUser(paramUser.userName)

        result.assert(existingUser !== undefined, `User [${paramUser.userName}] does not exists on [${remoteGateway.ip}]`)
        if (!result.isSuccessful()) return result

        var newEntry = this.getEntryById(remoteGateway.guiId)

        if (!newEntry) {
            newEntry = new HackedDbEntry({
                guiId: remoteGateway.guiId,
                ip: remoteGateway.ip,
            })

            this.entries.push(newEntry)
        }

        var dbUser = newEntry.users.find(u => u.userName === paramUser.userName)

        if (dbUser) {
            dbUser.password = paramUser.password
        }
        else {
            dbUser = new User({
                userName: paramUser.userName,
                password: paramUser.password,
                partial: paramUser.partial
            })
            newEntry.users.push(dbUser)
        }

        result.details = { entry: newEntry }
        return result
    }

    toClient(): Partial<Gui.HackedDB> {
        return <Partial<Gui.HackedDB>>{
            entries: this.entries.map(e => e.toClient())
        }
    }

}