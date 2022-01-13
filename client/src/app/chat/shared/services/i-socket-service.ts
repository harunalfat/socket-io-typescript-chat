
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Event } from "../model/event";
import { Message, ServerEventWrapper } from "../model/message";

@Injectable()
export abstract class ISocketService {
    abstract initSocket(any: any): void
    abstract send(message: Message): void
    abstract subscribe(channelId: string, cb: (message: ServerEventWrapper<Message>) => void): void
    abstract onMessage(): void
    abstract onEvent(event: Event): Observable<any>
}