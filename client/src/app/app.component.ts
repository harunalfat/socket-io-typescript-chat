import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DialogChannelComponent } from './chat/dialog-channel/dialog-channel.component';
import { Channel } from './chat/shared/model/channel';
import { IStoreUserService } from './chat/shared/services/i-store-user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  channels: Channel[] = []
  currentChannel: Channel = null;
  dialogRef: MatDialogRef<DialogChannelComponent> | null;
  public static returned: Subject<any> = new Subject()

  constructor(
    public dialog: MatDialog,
    private storedUserService: IStoreUserService,
    private translate: TranslateService,
  ) {
    translate.setDefaultLang('en');
    storedUserService.getInitChannelObservable().subscribe( (channel: Channel) => {
      this.currentChannel = channel;
      this.channels = this.storedUserService.getAllChannels();
      console.log(this.channels)
    })
  }

  openAddChannelDialog() {
    this.dialogRef = this.dialog.open(DialogChannelComponent)
    this.dialogRef.afterClosed().subscribe(async feedBack => {
      if (!feedBack?.channelName) return;

      const channel = await this.storedUserService.addChannel(feedBack.channelName, this.storedUserService.getStoredUser(), false);
      if (!channel) return

      this.channels = this.storedUserService.getAllChannels();
      this.currentChannel = channel
      this.storedUserService.announceChangeChannel(channel)
    })
  }

  onChannelClick(channel: Channel) {
    this.currentChannel = channel
    this.storedUserService.announceChangeChannel(channel);
  }

  ngOnInit(): void {
    this.translate.use('en');
  }

  private initModel(): void {
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
