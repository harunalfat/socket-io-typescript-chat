import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IStoreUserService } from '../shared/services/i-store-user.service';

@Component({
  selector: 'app-dialog-private',
  templateUrl: './dialog-private.component.html',
})
export class DialogPrivateComponent implements OnInit {
  userFormControl = new FormControl('', [Validators.required]);
  suggestions: string[] = ['apaaa', 'apooo', 'asemm']
  previousUsername: string;
  filteredOptions: Observable<string[]>

  constructor(public dialogRef: MatDialogRef<DialogPrivateComponent>,
    private storeUser: IStoreUserService,
    @Inject(MAT_DIALOG_DATA) public params: any) {
    this.userFormControl.setValue(null);
  }

  ngOnInit() {
    console.log("WOOOYadad")
    this.filteredOptions = this.userFormControl.valueChanges.pipe(
      startWith(''),
      map(v => this._compare(v))
    )
  }

  private _compare(filterValue: string): string[] {
    if (!filterValue) return;
    console.log("WOOOY")
    const loweredFilterValue = filterValue.toLowerCase();

    return this.suggestions.filter(sugg => sugg.toLowerCase().includes(loweredFilterValue))
  }

  public onSave(): void {
    this.dialogRef.close({
      username: this.userFormControl.value,
    });
  }

}
