import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatList, MatListItem } from '@angular/material/list';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DialogPrivateComponent } from './dialog-private/dialog-private.component';
import { DialogUserType } from './dialog-user/dialog-user-type';
import { DialogUserComponent } from './dialog-user/dialog-user.component';
import { Action } from './shared/model/action';
import { Event } from './shared/model/event';
import { Message } from './shared/model/message';
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
  currentChannel: string;
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
    this.storedUser.getChangeChannelObservable().subscribe(channelName => {
      this.messages = this.storedUser.getMessages(channelName)
      console.log(this.messages)
      this.currentChannel = channelName
    })
  }

  ngOnInit(): void {
    this.initModel();
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

  private initModel(): void {
    const randomId = this.getRandomId();
    this.user = {
      id: randomId,
      avatar: `${AVATAR_URL}/${randomId}.png`
    };
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.socketService.onMessage()
      .subscribe((message: Message) => {
        console.log(message)
        this.storedUser.storeMessage(message, message.channel)
        
        if (message.channel === this.currentChannel)
          this.messages.push(message);
      });

    this.socketService.onEvent(Event.SUBSCRIBE)
      .subscribe(data => {
        console.log(`Server subscribe user [${this.user.name}] to channel [${data.channel.name}]`)
        
      })

    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });

    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });
  }

  private getRandomId(): number {
    return Math.floor(Math.random() * (1000000)) + 1;
  }

  public onClickPrivateMessage() {
    this.dialogPrivateChannelRef = this.dialog.open(DialogPrivateComponent);
    this.dialogPrivateChannelRef.afterClosed().subscribe(dialogParams => {
      const username = dialogParams.username
      if (username == this.user.name) return

      console.log("MASIH MASUKK")

      const joinName: string[] = [this.user.name, username]
      joinName.sort((l,r) => l < r ? -1 : 1)
      const privateChannelName = joinName.join(" & ")
      this.storedUser.addChannel(privateChannelName)
      this.storedUser.announceInitialChannel(privateChannelName)
      this.storedUser.storeAllMessages(this.messages, this.currentChannel)
      this.messages = this.storedUser.getMessages(privateChannelName)
      this.currentChannel = privateChannelName
    })
  }

  private openNewUserPopup(params): void {
    this.dialogUserRef = this.dialog.open(DialogUserComponent, params);
    this.dialogUserRef.afterClosed().subscribe(paramsDialog => {
      if (!paramsDialog) {
        return;
      }
  
      this.storedUserName = JSON.parse(sessionStorage.getItem("user"));
      this.user.name = paramsDialog.username;

      if (paramsDialog.dialogType === DialogUserType.NEW) {
        
        this.messages = this.storedUser.getMessages('lobby')
        this.storedUser.addChannel('lobby');
        this.currentChannel = 'lobby';
        
        this.storedUser.announceInitialChannel('lobby')
        this.storedUser.storeUser(this.user.name);
        this.initIoConnection();
        this.sendNotification(paramsDialog, Action.JOINED);
      }
    });
  }

  public sendMessage(message: string, channel: string): void {
    if (!message) {
      return;
    }

    this.socketService.send({
      from: this.user,
      content: message,
      channel: channel,
    });
    this.messageContent = null;
  }

  public sendNotification(params: any, action: Action): void {
    let message: Message;

    if (action === Action.JOINED) {
      message = {
        from: this.user,
        channel: 'lobby',
        action
      };
    } else if (action === Action.RENAME) {
      message = {
        action,
        channel: 'lobby',
        content: {
          username: this.user.name,
          previousUsername: params.previousUsername
        }
      };
    }

    this.socketService.send(message);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}
