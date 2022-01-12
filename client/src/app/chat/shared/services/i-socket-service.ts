
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Event } from "../model/event";
import { Message } from "../model/message";

@Injectable()
export abstract class ISocketService {
    abstract initSocket(): void
    abstract send(message: Message): void
    abstract onMessage(): Observable<Message>
    abstract onEvent(event: Event): Observable<any>
}