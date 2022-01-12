import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Message } from "../model/message";

@Injectable()
export abstract class IStoreUserService {
    abstract getStoredUser()
    abstract getAllUsers(): string[]
    abstract storeUser(userId: string)
    abstract getAllChannelNames(): string[]
    abstract addChannel(channelId: string)
    abstract storeAllMessages(messages: Message[], channelId: string)
    abstract storeMessage(message: Message, channelId: string)
    abstract getMessages(channelId: string): Message[]
    abstract announceInitialChannel(channelId: string)
    abstract announceChangeChannel(channelId: string)
    abstract getChangeChannelObservable(): Observable<any>
    abstract getInitChannelObservable(): Observable<any>
}