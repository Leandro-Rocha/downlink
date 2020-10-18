import { Presentable, Gui, GameEntity, EntityType } from "../../../common/types"
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


export class HackedDbEntry implements GameEntity, Presentable<Gui.HackedDbEntry> {
    id: string
    entityType: EntityType = EntityType.HACKED_DB_ENTRY

    hostname: string
    ip: string
    user: User

    constructor(config: Partial<HackedDbEntry>) {
        this.id = config.id || `HackedDbEntry_${Date.now()}`
        this.hostname = config.hostname || ''
        this.ip = config.ip || ''
        this.user = config.user!
    }

    toClient(): GameEntity & Gui.HackedDbEntry {
        return {
            id: this.id,
            entityType: this.entityType,

            ip: this.ip,
            hostname: this.hostname,
            user: this.user
        }
    }
}

export class HackedDB implements GameEntity, Presentable<Gui.HackedDB> {
    id: string
    entityType: EntityType = EntityType.HACKED_DB

    entries: HackedDbEntry[]

    constructor(config?: Partial<HackedDB>) {
        this.id = config?.id || `HackedDB${Date.now()}`
        this.entries = config?.entries?.map(e => new HackedDbEntry(e)) || []
    }
    toClient(): GameEntity & Gui.HackedDB {
        return {
            id: this.id,
            entityType: this.entityType,

            entries: this.entries.map(e => e.toClient())
        }
    }

    getEntryById(id: string) {
        return this.entries.find(e => e.id === id)
    }

    // TODO: remove need for user
    addEntry(remoteGateway: Gateway, paramUser: Gui.User) {
        const result = new OperationResult<{ entry: Gui.HackedDbEntry }>()
        const existingUser = remoteGateway.getUser(paramUser.userName)

        result.assert(existingUser !== undefined, `User [${paramUser.userName}] does not exists on [${remoteGateway.ip}]`)
        if (!result.isSuccessful()) return result

        var newEntry = this.getEntryById(remoteGateway.id)

        if (!newEntry) {
            newEntry = new HackedDbEntry({
                id: remoteGateway.id,
                hostname: remoteGateway.hostname,
                ip: remoteGateway.ip,
            })

            this.entries.push(newEntry)
        }

        var dbUser = newEntry.user

        if (dbUser) {
            dbUser.password = paramUser.password
        }
        else {
            dbUser = new User({
                userName: paramUser.userName,
                password: paramUser.password,
                partial: paramUser.partial
            })
            newEntry.user = dbUser
        }

        result.details = { entry: newEntry }
        return result
    }

}