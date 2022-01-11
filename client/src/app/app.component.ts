import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DialogChannelComponent } from './chat/dialog-channel/dialog-channel.component';
import { StoreUserService } from './chat/shared/services/store-user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  channelNames: string[] = []
  currentChannel: string = null;
  dialogRef: MatDialogRef<DialogChannelComponent> | null;
  public static returned: Subject<any> = new Subject()

  constructor(
    public dialog: MatDialog,
    private storedUserService: StoreUserService,
    private translate: TranslateService,
  ) {
    translate.setDefaultLang('en');
    storedUserService.initialChannel$.subscribe( channelName => {
      this.currentChannel = channelName;
      this.channelNames = this.storedUserService.getAllChannelNames();
    })
  }

  openAddChannelDialog() {
    this.dialogRef = this.dialog.open(DialogChannelComponent)
    this.dialogRef.afterClosed().subscribe(feedBack => {
      if (!feedBack?.channelName) return;

      this.storedUserService.addChannel(feedBack.channelName);
      const channels = this.storedUserService.getAllChannelNames();

      this.channelNames = this.storedUserService.getAllChannelNames();
    })
  }

  onChannelClick(channelName: string) {
    console.log(this.currentChannel)
    console.log(channelName)
    this.currentChannel = channelName
    this.storedUserService.announceChangeChannel(channelName);
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
