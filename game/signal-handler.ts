import { Interruptions } from "./interruptions"

export class Observer {
    subscriber: any[] = []

    subscribe(who: any, what: any, cb: any) {
        if (!this.subscriber[what]) {
            this.subscriber[what] = [];
        }

        for (var i = 0; i < this.subscriber[what].length; i++) {
            var o = this.subscriber[what][i];
            if (o.item == who && o.callback == cb) {
                return;
            }
        }

        this.subscriber[what].push({ item: who, callback: cb });
    }

    unsubscribe(who: any, what: any) {
        if (!this.subscriber[what]) return;

        for (var i = 0; i < this.subscriber[what].length; i++) {
            var o = this.subscriber[what][i];
            if (o.item == who) {
                this.subscriber[what].splice(i, 1);
                return;
            }
        }
    }

    send(who: any, what: any, ...data: any) {
        if (!this.subscriber[what]) return;

        for (var i = 0; i < this.subscriber[what].length; i++) {
            var o = this.subscriber[what][i];
            o.callback.bind(o.item)(who, data)
        }
    }
}


