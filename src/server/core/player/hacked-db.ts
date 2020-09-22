import { Presentable, Types } from "../../../common/types"
import { Gateway } from "../gateway"
import faker from "faker";
import { OperationResult } from "../../../shared";


export class User implements Types.User {
    userName: string
    password: string
    partial: boolean

    constructor(config?: Partial<Types.User>) {
        this.userName = config?.userName || faker.internet.userName()
        this.password = config?.password !== undefined ? config.password : faker.internet.password()
        this.partial = config?.partial || false
    }
}


export class HackedDbEntry implements Types.HackedDbEntry, Presentable<Types.HackedDbEntry> {
    id: string
    ip: string
    users: User[]

    constructor(config: Partial<HackedDbEntry>) {
        this.id = config.id || ''
        this.ip = config.ip || ''
        this.users = config.users || []
    }

    toClient(): Partial<Types.HackedDbEntry> {
        return {
            ip: this.ip,
            users: this.users
        }
    }
}

export class HackedDB implements Types.HackedDB, Presentable<Types.HackedDB> {
    entries: HackedDbEntry[]

    constructor(config?: Partial<Types.HackedDB>) {
        this.entries = config?.entries?.map(e => new HackedDbEntry(e)) || []
    }

    getEntryById(id: string) {
        return this.entries.find(e => e.id === id)
    }

    addEntry(remoteGateway: Gateway, paramUser: Types.User) {
        const result = new OperationResult<{ entry: Types.HackedDbEntry }>()
        const existingUser = remoteGateway.getUser(paramUser.userName)

        result.validate(existingUser !== undefined, `User [${paramUser.userName}] does not exists on [${remoteGateway.ip}]`)
        if (!result.isSuccessful()) return result

        var newEntry = this.getEntryById(remoteGateway.id)

        if (!newEntry) {
            newEntry = new HackedDbEntry({
                id: remoteGateway.id,
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

    toClient(): Partial<Types.HackedDB> {
        return <Partial<Types.HackedDB>>{
            entries: this.entries.map(e => e.toClient())
        }
    }

}