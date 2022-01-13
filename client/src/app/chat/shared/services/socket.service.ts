import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { Event } from '../model/event';
import { Message, ServerEventWrapper } from '../model/message';
import { ISocketService } from './i-socket-service';


const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class SocketService implements ISocketService {
    private socket;

    subscribe(channelId: string, cb: (message: ServerEventWrapper<Message>) => void): void {
        throw new Error('Method not implemented.');
    }

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
    }

    public send(message: Message): void {
        this.socket.emit('message', message);
    }

    public onMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            this.socket.on('message', (data: Message) => observer.next(data));
        });
    }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}
