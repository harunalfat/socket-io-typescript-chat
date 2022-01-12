import { Injectable } from "@angular/core";
import * as Centrifuge from "centrifuge";
import { Observable } from "rxjs";
import { Event } from "../model/event";
import { Message } from "../model/message";
import { ISocketService } from "./i-socket-service";
import { IStoreUserService } from "./i-store-user.service";

@Injectable()
export class CentrifugeService implements ISocketService {

    private BASE_URL = "ws://localhost:8000/connection/websocket"
    private centrifuge: Centrifuge

    constructor(
        private storedUser: IStoreUserService,
    ){}

    initSocket(): void {
        const url = this.BASE_URL;
        this.centrifuge = new Centrifuge(url);
        this.centrifuge.connect();
    }

    send(message: Message): void {
        this.centrifuge.publish(message.channel, message)
    }

    onMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            this.centrifuge.on('', () => {

            })
        })
    }

    onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.centrifuge.on(event, (data) => observer.next(data))
        })
    }

}