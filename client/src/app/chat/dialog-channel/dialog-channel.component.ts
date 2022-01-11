import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { StoreUserService } from '../shared/services/store-user.service';

@Component({
  selector: 'app-dialog-channel',
  templateUrl: './dialog-channel.component.html',
  styleUrls: ['./dialog-channel.component.css']
})
export class DialogChannelComponent implements OnInit {
  channelFormControl = new FormControl('', [Validators.required]);
  previousUsername: string;

  constructor(public dialogRef: MatDialogRef<DialogChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public params: any,
    private translate: TranslateService,
    private storedUser: StoreUserService) {
    this.previousUsername = storedUser.getStoredUser() ? storedUser.getStoredUser() : (params.username ? params.username : undefined);
    this.channelFormControl.setValue(null);
    translate.setDefaultLang('en');
  }

  ngOnInit() {
  }

  public onSave(): void {
    this.dialogRef.close({
      channelName: this.channelFormControl.value,
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}
