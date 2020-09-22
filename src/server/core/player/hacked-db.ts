import { Presentable, Types } from "../../../common/types"
import { Gateway } from "../gateway"


class User implements Types.User {
    userName: string
    password: string

    constructor(config: Types.User) {
        this.userName = config.userName
        this.password = config.password
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
        return <Partial<HackedDbEntry>>{
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

    addEntry(gateway: Gateway, user: Types.User) {
        var entry = this.getEntryById(gateway.id)

        if (!entry) {
            entry = new HackedDbEntry({
                id: gateway.id,
                ip: gateway.ip,
            })

            this.entries.push(entry)
        }

        var dbUser = entry.users.find(u => u.userName === user.userName)

        if (dbUser) {
            dbUser.password = user.password
        }
        else {
            dbUser = new User({ userName: user.userName, password: user.password })
            entry.users.push(dbUser)
        }

        return entry
    }

    toClient(): Partial<Types.HackedDB> {
        return <Partial<Types.HackedDB>>{
            entries: this.entries.map(e => e.toClient())
        }
    }

}