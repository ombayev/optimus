import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { FormGroup } from '@angular/forms';

// rxjs
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// ngrx
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../../../store';
import * as fromKaizen from '../../../../store';

// ngrx actions
import * as fromErrorActions from '../../../../../../store/actions/errors.actions';
import * as fromProjectsActions from '../../../../store/actions/projects.actions';

// interfaces
import { KaizenProjectItem } from '../../../../../../shared/interface/kaizen.model';

// services
import { KaizenFormHttpService } from '../../form-services/kaizen-form-http.service';

@Component({
  selector: 'app-kaizen-form-actions-new',
  styleUrls: ['kaizen-form-actions-new.component.scss'],
  template: `
    <!-- <button mat-button color="primary" (click)="log()">LOG</button> -->

    <button mat-button color="primary"
      [disabled]="!fg_fields.valid || savingChanges"
      (click)="onSave()">
      <span *ngIf="!savingChanges">SAVE</span>
      <span *ngIf="savingChanges">SAVING </span>
      <fa-icon *ngIf="savingChanges" [icon]="['fas', 'spinner']" [spin]="true" matTooltip="Saving changes"></fa-icon>
    </button>

    <button mat-button tabindex="-1"
      (click)="closeForm.emit()">
      CANCEL
    </button>
    `
})
export class KaizenFormActionsNewComponent implements OnInit, OnDestroy {
  @Input() fg_fields: FormGroup;
  @Input() fg_image: FormGroup;

  @Output() closeForm = new EventEmitter<any>();

  $watchArrayBuffer: Subscription; // unsubscription handled in ngOnDestroy

  // activates spinner
  savingChanges = false;

  // toggles save button
  hasUnsavedPhoto = false;

  constructor(
    private store_root: Store<fromRoot.RootState>,
    private store_kaizen: Store<fromKaizen.KaizenState>,
    private spHttp: KaizenFormHttpService
  ) {}

  ngOnInit() {
    this.$watchArrayBuffer = this.fg_image
      .get('ArrayBuffer')
      .valueChanges.subscribe(arrayBuffer =>
        this.onArrayBufferChange(arrayBuffer)
      );
  }

  ngOnDestroy() {
    this.$watchArrayBuffer.unsubscribe();
  }

  // user has unsaved photo when ArrayBuffer is not 0
  onArrayBufferChange(arrayBuffer: ArrayBuffer) {
    arrayBuffer.byteLength
      ? (this.hasUnsavedPhoto = true)
      : (this.hasUnsavedPhoto = false);
  }

  onSave() {
    this.savingChanges = true;

    // (1) first save fields,
    // then photo is uploaded in its attachments
    this.saveFields(this.fg_fields.getRawValue());
  }

  saveFields(newFields: KaizenProjectItem) {
    this.spHttp
      .createProject(newFields)
      .pipe(take(1))
      .subscribe(
        success => this.saveFieldsSuccess(success as KaizenProjectItem),
        error => this.saveFieldsError(error),
        () => console.log('completed adding new user')
      );
  }

  saveFieldsSuccess(newProject: KaizenProjectItem) {
    // add newly created user to users store
    // update fg_photo by adding ID of created user
    // check if form has unsaved photo and upload it
    // if no unsaved photo, then close form
    console.log('get new user');
    console.log(newProject);
    this.spHttp
      .getItemById(newProject.ID)
      .pipe(take(1))
      .subscribe(
        success =>
          this.getNewlyCreatedItemSuccess(success as KaizenProjectItem[]),
        error => console.log(error),
        () => console.log('completed getting newly created item')
      );
  }

  getNewlyCreatedItemSuccess(newItemExpanded: KaizenProjectItem[]) {
    console.log('get new item expanded');
    console.log(newItemExpanded);
    this.fg_image.get('ID').patchValue(newItemExpanded[0].ID);
    this.store_kaizen.dispatch(
      new fromProjectsActions.InsertOneProject({
        ...newItemExpanded[0],
        id: newItemExpanded[0].ID,
        New: true
      })
    );
    this.closeFormOrUploadPhoto();
  }

  saveFieldsError(error) {
    this.savingChanges = false;
    console.log(error);
    this.store_root.dispatch(new fromErrorActions.DisplayError(error));
  }

  saveImage() {
    this.spHttp
      .saveImage(this.fg_image.value)
      .pipe(take(1))
      .subscribe(
        success => this.saveImageSuccess(success),
        error => this.saveImageError(error),
        () => console.log('completed saving photo of new user')
      );
  }

  saveImageSuccess(newPhoto) {
    // photo saved, no unsaved photo left
    // prepare changes object to update user item in state
    // update relevant user item by adding photo
    // close form

    this.hasUnsavedPhoto = false;

    const changes: KaizenProjectItem = {
      Attachments: true,
      AttachmentFiles: {
        results: newPhoto
      }
    };

    this.store_kaizen.dispatch(
      new fromProjectsActions.UpdateOneProject(
        this.fg_image.get('ID').value,
        changes
      )
    );

    this.closeFormOrUploadPhoto();
  }

  saveImageError(error) {
    this.savingChanges = false;
    console.log(error);
    this.store_root.dispatch(new fromErrorActions.DisplayError(error));
  }

  closeFormOrUploadPhoto() {
    // if form has unsaved photo then upload it
    if (this.hasUnsavedPhoto) {
      this.savingChanges = true;
      this.saveImage();
    } else {
      console.log(this.fg_fields.value);
      this.savingChanges = false;
      this.closeForm.emit({
        result: 'success',
        data: this.fg_fields.value
      });
    }
  }

  log() {
    console.log(this.fg_fields.getRawValue());
    console.log(this.fg_image.value);
  }
}
