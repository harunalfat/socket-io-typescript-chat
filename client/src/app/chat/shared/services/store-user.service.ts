import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../model/message';

const CHANNEL_NAMES = "channelNames";

@Injectable({
  providedIn: 'root'
})
export class StoreUserService {

  constructor() { }

  private initialChannelSource = new Subject<string>();
  private changeChannelSource = new Subject<string>();

  initialChannel$ = this.initialChannelSource.asObservable();
  changeChannel$ = this.changeChannelSource.asObservable();

  /**
   * getStoredUser
   */
  public getStoredUser() {
    let storedUser = sessionStorage.getItem("userName");
    return storedUser ? storedUser : "";
  }

  /**
   * storeUser
   */
  public storeUser(userName) {
    sessionStorage.setItem("userName", userName);
  }

  public getAllChannelNames(): string[] {
    const res = JSON.parse(sessionStorage.getItem(CHANNEL_NAMES));
    return res || []
  }

 public addChannel(channelName: string) {
    const allChannels = this.getAllChannelNames();
    if (!allChannels.includes(channelName)) {
      allChannels.push(channelName);
    }

    allChannels.sort((a,b) => a < b ? -1 : 1)

    sessionStorage.setItem(CHANNEL_NAMES, JSON.stringify(allChannels))
 }

 public storeAllMessages(messages: Message[], channelName: string) {
    sessionStorage.setItem(`channels:${channelName}`, JSON.stringify(messages))
 }

 public storeMessage(message: Message, channelName: string) {
    const channelMessages = this.getMessages(channelName)
    console.log(channelMessages)
    channelMessages.push(message)
 }

 public getMessages(channelName: string): Message[] {
    const res = JSON.parse(sessionStorage.getItem(`channels:${channelName}`))
    return res ? res : []
 }

 public announceInitialChannel(channelName: string) {
   this.initialChannelSource.next(channelName);
 }

 public announceChangeChannel(channelName: string) {
   this.changeChannelSource.next(channelName);
 }

}
