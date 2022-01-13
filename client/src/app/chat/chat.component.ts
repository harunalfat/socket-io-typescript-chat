import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatList, MatListItem } from '@angular/material/list';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DialogPrivateComponent } from './dialog-private/dialog-private.component';
import { DialogUserType } from './dialog-user/dialog-user-type';
import { DialogUserComponent } from './dialog-user/dialog-user.component';
import { Action } from './shared/model/action';
import { Channel } from './shared/model/channel';
import { Event } from './shared/model/event';
import { Message, ServerEventWrapper } from './shared/model/message';
import { User } from './shared/model/user';
import { ISocketService } from './shared/services/i-socket-service';
import { IStoreUserService } from './shared/services/i-store-user.service';



const AVATAR_URL = 'https://api.adorable.io/avatars/285';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  action = Action;
  user: User;
  currentChannel: Channel;
  messages: Message[] = [];
  messageContent: string;
  storedUserName: string;
  dialogUserRef: MatDialogRef<DialogUserComponent> | null;
  dialogPrivateChannelRef: MatDialogRef<DialogPrivateComponent> | null;
  defaultDialogUserParams: any = {
    disableClose: true,
    data: {
      title: 'Welcome',
      title_pt: 'Bem-vindo',
      dialogType: DialogUserType.NEW
    }
  };
  
  public static returned: Subject<any> = new Subject();

  // getting a reference to the overall list, which is the parent container of the list items
  @ViewChild(MatList, { read: ElementRef, static: true }) matList: ElementRef;

  // getting a reference to the items/messages within the list
  @ViewChildren(MatListItem, { read: ElementRef }) matListItems: QueryList<MatListItem>;

  constructor(private socketService: ISocketService,
    private storedUser: IStoreUserService,
    public dialog: MatDialog, private translate: TranslateService) {
    translate.setDefaultLang('en');
    this.storedUser.getChangeChannelObservable().subscribe(passedChannel => {
      const channels = this.storedUser.getAllChannels()
      if (channels.find(c => c.id !== passedChannel.id)) {
        this.socketService.subscribe(passedChannel.id, (message) => {
          this.onSubscribeMessage(message, passedChannel)
        })
      }

      this.messages = this.storedUser.getMessages(passedChannel.id) || []
      this.currentChannel = passedChannel
      console.log(this.currentChannel)
    })
  }

  ngOnInit(): void {
    this.user = this.storedUser.getStoredUser();
    // Using timeout due to https://github.com/angular/angular/issues/14748
    setTimeout(() => {
      this.openNewUserPopup(this.defaultDialogUserParams);
    }, 0);
  }

  ngAfterViewInit(): void {
    // subscribing to any changes in the list of items / messages
    this.matListItems.changes.subscribe(elements => {
      this.scrollToBottom();
    });
  }

  // auto-scroll fix: inspired by this stack overflow post
  // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
  private scrollToBottom(): void {
    try {
      this.matList.nativeElement.scrollTop = this.matList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  onSubscribeMessage(message: ServerEventWrapper<Message>, channel: Channel) {
    this.storedUser.storeMessage(message, message.data.channelId)
    if (this.currentChannel.id === channel.id) {
      this.messages.push(message.data)
      this.storedUser.getMessages(message.data.channelId);
    }
  }

  private initIoConnection(): void {
    this.socketService.initSocket(this.user.id);
    for (const channel of this.user.channels) {
      if (channel.name === "Lobby") {
        this.currentChannel = channel
        this.messages = this.storedUser.getMessages(this.currentChannel.id) || [];
        console.log(this.messages)
        this.storedUser.announceInitialChannel(channel)
      }
      this.socketService.subscribe(channel.id, (message) => {
        this.onSubscribeMessage(message, channel)
      })
    }

    this.socketService.onEvent(Event.SUBSCRIBE)
      .subscribe(data => {
        console.log(`Server subscribe user [${this.user.username}] to channel [${data.channel.name}]`)
        
      })

    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });

    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe((data) => {
        console.log('disconnected');
        console.log(data)
      });
  }

  public onClickPrivateMessage() {
    this.dialogPrivateChannelRef = this.dialog.open(DialogPrivateComponent);
    this.dialogPrivateChannelRef.afterClosed().subscribe(dialogParams => {
      const username = dialogParams.username
      if (username == this.user.username) return

      console.log("MASIH MASUKK")

      const joinName: string[] = [this.user.username, username]
      joinName.sort((l,r) => l < r ? -1 : 1)
      const privateChannelName = joinName.join(" & ")
      this.storedUser.addChannel(privateChannelName, this.user, true)
      //this.storedUser.announceInitialChannel(privateChannelName)
      this.storedUser.storeAllMessages(this.messages, this.currentChannel.id)
      this.messages = this.storedUser.getMessages(privateChannelName)
      this.currentChannel = null
    })
  }

  private openNewUserPopup(params): void {
    this.dialogUserRef = this.dialog.open(DialogUserComponent, params);
    this.dialogUserRef.afterClosed().subscribe(async paramsDialog => {
      console.log(paramsDialog)
      if (!paramsDialog) {
        return;
      }

      if (paramsDialog.dialogType === DialogUserType.NEW) {
        const result = await this.storedUser.storeUser({
          username: paramsDialog.username,
        })
        this.user = result;
        sessionStorage.setItem("channelList", JSON.stringify(this.user.channels))
        this.initIoConnection();
      }
    });
  }

  public sendMessage(message: string, channel: string): void {
    console.log(channel)
    if (!message) {
      return;
    }

    const msg: Message = {
      sender: {
        id: this.user.id,
        username: this.user.username,
      },
      data: message,
      channelId: channel,
    }

    this.socketService.send(msg);
    this.messageContent = null;
  }

  public sendNotification(_: any, action: Action): void {
    let message: Message;

    if (action === Action.JOINED) {
      message = {
        sender: this.user,
        channelId: 'lobby',
        action
      };
    } 

    this.socketService.send(message);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}
