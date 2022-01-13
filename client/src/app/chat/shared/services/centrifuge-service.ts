import { Injectable } from "@angular/core";
import * as Centrifuge from "centrifuge";
import { Observable } from "rxjs";
import { Event } from "../model/event";
import { Message, ServerEventWrapper } from "../model/message";
import { ISocketService } from "./i-socket-service";
import { IStoreUserService } from "./i-store-user.service";

@Injectable({
    providedIn: 'root'
})
export class CentrifugeService implements ISocketService {

    private BASE_URL = "ws://localhost:8000/connection/websocket"
    private centrifuge: Centrifuge

    constructor(
        private storedUser: IStoreUserService,
    ){}

    subscribe(channelId: string, cb: (message: ServerEventWrapper<Message>) => void): void {
        this.centrifuge.subscribe(channelId, cb)
    }

    initSocket(token: string): void {
        const url = this.BASE_URL + `?userId=${token}`;
        this.centrifuge = new Centrifuge(url, {
            debug: true
        });
        this.centrifuge.connect();
        console.log("DIPANGGIL")
    }

    send(message: Message): void {
        this.centrifuge.publish(message.channelId, message)
    }

    onMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            observer.next()
        })
    }

    onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.centrifuge.on(event, (data) => observer.next(data))
        })
    }

}