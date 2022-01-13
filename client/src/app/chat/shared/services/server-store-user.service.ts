import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Message } from "../model/message";
import { User } from "../model/user";
import { IStoreUserService } from "./i-store-user.service";
import { Axios, AxiosResponse } from "axios";
import { Channel } from "../model/channel";

interface Response<T> {
    data: T
    errors: string[]
}

@Injectable({
    providedIn: 'root',
})
export class ServerStoreUserService implements IStoreUserService {

    constructor() {}

    private initialChannelSource = new Subject<Channel>();
    private changeChannelSource = new Subject<Channel>();
    private axios = new Axios({
        baseURL: "http://localhost:8000"
    })

    getChangeChannelObservable(): Observable<any> {
        return this.changeChannelSource.asObservable();
    }

    getInitChannelObservable(): Observable<any> {
        return this.initialChannelSource.asObservable();
    }

    getStoredUser() {
        const user = JSON.parse(sessionStorage.getItem("user"))
        return user
    }

    getAllUsers(): string[] {
        throw new Error("Method not implemented.");
    }

    async storeUser(user: User): Promise<User> {        
        const res = await this.axios.post<string>('/users', JSON.stringify(user))
        if (res.status != 201) {
            console.error("Failed to store user")
            return
        }

        console.log(res.data)
        const resp: Response<User> = JSON.parse(res.data)
        sessionStorage.setItem("user", JSON.stringify(resp.data))
        return resp.data
    }

    getAllChannels(): Channel[] {
        const res = JSON.parse(sessionStorage.getItem("channelList"))
        return res
    }

    async addChannel(channelName: string, creator: User, isPrivate = false): Promise<Channel> {
        const channel: Channel = {
            name: channelName,
            creatorId: creator.id,
            isPrivate,
            hashIdentifier: "",
        }

        const resp = await this.axios.post<string>(`/channels?userId=${creator.id}`, JSON.stringify(channel))
        if (resp.status != 201) {
            console.error("Failed to store channel")
            return
        }

        const parsed: Response<any> = JSON.parse(resp.data)
        const channels = this.getAllChannels()
        if (channels.find(c => c.id !== parsed.data.channel.id)) {
            channels.push(parsed.data.channel)
            channels.sort((a,b) => a.name < b.name ? -1 : 1)
            sessionStorage.setItem("channelList", JSON.stringify(channels))
        }

        return parsed.data.channel
    }

    storeAllMessages(messages: Message[], channelId: string) {
        sessionStorage.setItem(channelId, JSON.stringify(messages))
    }

    storeMessage(message: Message, channelId: string) {
        const messages = this.getMessages(channelId) || []
        messages.push(message.data)
        this.storeAllMessages(messages, channelId)
    }

    getMessages(channelId: string): Message[] {
        return JSON.parse(sessionStorage.getItem(channelId))
    }

    announceInitialChannel(channel: Channel) {
        this.initialChannelSource.next(channel)
    }

    announceChangeChannel(channel: Channel) {
        this.changeChannelSource.next(channel)
    }
}