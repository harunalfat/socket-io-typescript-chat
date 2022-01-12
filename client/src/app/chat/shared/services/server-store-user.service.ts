import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Message } from "../model/message";
import { IStoreUserService } from "./i-store-user.service";

@Injectable({
    providedIn: 'root',
})
export class ServerStoreUserService implements IStoreUserService {
    constructor() {}

    private initialChannelSource = new Subject<string>();
    private changeChannelSource = new Subject<string>();

    getChangeChannelObservable(): Observable<any> {
        return this.changeChannelSource.asObservable();
    }

    getInitChannelObservable(): Observable<any> {
        return this.initialChannelSource.asObservable();
    }

    getStoredUser() {
        return "JAKA"
    }

    getAllUsers(): string[] {
        throw new Error("Method not implemented.");
    }

    storeUser(userId: string) {
        throw new Error("Method not implemented.");
    }

    getAllChannelNames(): string[] {
        throw new Error("Method not implemented.");
    }

    addChannel(channelId: string) {
        throw new Error("Method not implemented.");
    }

    storeAllMessages(messages: Message[], channelId: string) {
        throw new Error("Method not implemented.");
    }

    storeMessage(message: Message, channelId: string) {
        throw new Error("Method not implemented.");
    }

    getMessages(channelId: string): Message[] {
        throw new Error("Method not implemented.");
    }

    announceInitialChannel(channelId: string) {
        throw new Error("Method not implemented.");
    }

    announceChangeChannel(channelId: string) {
        throw new Error("Method not implemented.");
    }
}