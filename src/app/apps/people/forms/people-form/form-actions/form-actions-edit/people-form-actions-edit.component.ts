import { SpListItemAttachmentFiles } from "../../../../../../shared/interface/sp-list-item.model";
import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter
} from "@angular/core";
import { FormGroup } from "@angular/forms";

// rxjs
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";

// ngrx
import { Store } from "@ngrx/store";

import * as _ from "lodash";

import * as fromRoot from "../../../../../../store";
import * as fromErrorActions from "../../../../../../store/actions/errors.actions";

import * as fromPeople from "../../../../store";
import * as fromUsersActions from "../../../../store/actions/users.action";

// interfaces
import {
  PeopleItem,
  ToSaveUserPhoto
} from "../../../../../../shared/interface/people.model";

// services
import { PeopleFormHttpService } from "../../form-services/people-form-http.service";

@Component({
  selector: "app-people-form-actions-edit",
  styleUrls: ["people-form-actions-edit.component.scss"],
  template: `
    <!-- btn for saving changes in edit mode -->
    <button
      mat-button
      tabindex="-1"
      color="primary"
      class="mat-button__fa-icon"
      [disabled]="
        !fg_fields.valid ||
        (!hasUnsavedFields && !hasUnsavedPhoto) ||
        savingChanges
      "
      (click)="onSaveChanges()"
    >
      <!-- two span els needed to have right vertical alignment -->
      <span
        *ngIf="savingChanges"
        class="cta__fa-icon"
        matTooltip="Saving changes"
      >
        <fa-icon [icon]="['fas', 'spinner']" [spin]="true"></fa-icon>
      </span>
      <!-- <span class="g_form-button__text">SAVE</span> -->
      <span
        *ngIf="!savingChanges"
        class="cta__fa-icon"
        matTooltip="Save changes"
      >
        <fa-icon [icon]="['far', 'save']"></fa-icon>
      </span>
    </button>

    <button mat-button tabindex="-1" (click)="switchFormMode.emit('view')">
      CANCEL
    </button>

    <app-people-form-actions-edit-fields
      [fg_fields]="fg_fields"
      [initialFields]="initialFields"
      (whenUnsavedFieldsChange)="unsavedFieldsChange($event)"
    >
    </app-people-form-actions-edit-fields>
  `
})
export class PeopleFormActionsEditComponent implements OnInit, OnDestroy {
  @Input() fg_fields: FormGroup;
  @Input() fg_photo: FormGroup;
  @Input() initialFields: PeopleItem;

  @Output() switchFormMode = new EventEmitter<any>();

  @Output() updateDataItem = new EventEmitter<PeopleItem>();
  @Output()
  updateFormGroupPhoto = new EventEmitter<SpListItemAttachmentFiles[]>();

  unsavedFields: PeopleItem = {};

  // activates spinner
  savingChanges = false;

  hasUnsavedFields = false;
  hasUnsavedPhoto = false;

  // subscriptions
  $saveChangesFields: Subscription; // unsubscription handled in function
  $saveNewPhoto: Subscription; // unsubscription handled in function
  $watchArrayBuffer: Subscription; // unsubscription handled in ngOnDestroy

  constructor(
    private store_root: Store<fromRoot.RootState>,
    private store_people: Store<fromPeople.PeopleState>,
    private spHttp: PeopleFormHttpService
  ) {
    console.log("people-form-actions-edit: initialized");
  }

  ngOnInit() {
    this.$watchArrayBuffer = this.fg_photo
      .get("ArrayBuffer")
      .valueChanges.subscribe(arrayBuffer =>
        this.onArrayBufferChange(arrayBuffer)
      );
  }

  // user has unsaved photo when ArrayBuffer is not 0
  onArrayBufferChange(arrayBuffer: ArrayBuffer) {
    arrayBuffer.byteLength
      ? (this.hasUnsavedPhoto = true)
      : (this.hasUnsavedPhoto = false);
  }

  // check if unsavedFields object has props or not
  checkObjectHasProperties(unsavedFields): boolean {
    return Object.keys(unsavedFields).length === 0 &&
      unsavedFields.constructor === Object
      ? false
      : true;
  }

  // triggered from child component
  unsavedFieldsChange(unsavedFields) {
    this.hasUnsavedFields = this.checkObjectHasProperties(unsavedFields);
    this.unsavedFields = { ...unsavedFields }; // immutable
    console.log(this.unsavedFields);
  }

  // when save btn clicked
  // user has (1) unsaved fields or (2) unsaved photo or (3) both
  onSaveChanges() {
    this.savingChanges = true;

    // (1) user has only unsaved fields
    if (this.hasUnsavedFields && !this.hasUnsavedPhoto) {
      this.saveChangesFields();
      // (2) user has only unsaved photo
    } else if (this.hasUnsavedPhoto && !this.hasUnsavedFields) {
      this.saveNewPhoto(this.fg_photo.value);
      // (3) user has both unsaved fields and unsaved photo
    } else if (this.hasUnsavedPhoto && this.hasUnsavedFields) {
      this.saveChangesFields();
    }
  }

  saveChangesFields() {
    console.log(this.unsavedFields);

    let fields = this.unsavedFields;

    // *** fix on 21-May-2019 by Zhandos Ombayev
    // *** because cannot use filters in SP calculated fields
    // combine 'Name' and 'Surname'
    // assign combined text to field 'Fullname2'
    // this way users may type name and surname and precisely find necessary user

    // check if Name and Surname both changed
    // if so, then modify Fullname2 accordingly

    if (_.has(fields, "Name") === true && _.has(fields, "Surname") === true) {
      fields = {
        ...fields,
        Fullname2: `${fields.Surname} ${fields.Name} ${fields.Name} ${
          fields.Surname
        }`
      };
    }

    // check if only Name changed
    // if so, then modify Fullname2 accordingly
    // Surname will come from initialFields

    if (_.has(fields, "Name") === true && _.has(fields, "Surname") === false) {
      fields = {
        ...fields,
        Fullname2: `${this.initialFields.Surname} ${fields.Name} ${
          fields.Name
        } ${this.initialFields.Surname}`
      };
    }

    // check if only Surname changed
    // if so, then modify Fullname2 accordingly
    // Name will come from initialFields

    if (_.has(fields, "Name") === false && _.has(fields, "Surname") === true) {
      fields = {
        ...fields,
        Fullname2: `${fields.Surname} ${this.initialFields.Name} ${
          this.initialFields.Name
        } ${fields.Surname}`
      };
    }

    this.$saveChangesFields = this.spHttp
      .updatePeopleItem(fields)
      .pipe(take(1))
      .subscribe(
        success => this.saveChangesFieldsSuccess(success),
        error => this.saveChangesFieldsError(error),
        () => console.log("$saveChangesFields completed")
      )
      .add(() => console.log("unsubscribed"));
  }

  // * success saving updated fields
  saveChangesFieldsSuccess(success: PeopleItem) {
    console.log("successfully saved fields:");
    console.log(success);

    this.$saveChangesFields.unsubscribe();
    this.unsavedFields = {};
    this.hasUnsavedFields = false;

    this.getAllFieldsOfUpdatedItem(success);
  }

  getAllFieldsOfUpdatedItem(updatedItem: PeopleItem) {
    console.log("getting all fields of updated item:");

    this.spHttp
      .getUserById(updatedItem.ID)
      .pipe(take(1))
      .subscribe(
        success =>
          this.getAllFieldsOfUpdatedItemSuccees(success[0] as PeopleItem),
        error => this.getAllFieldsOfUpdatedItemError(error),
        () => console.log("completed getting all fields of updated item")
      );
  }

  getAllFieldsOfUpdatedItemSuccees(fullItem: PeopleItem) {
    console.log("successfully got all fields of updated item:");
    console.log(fullItem);

    // now you want to update data.item
    // in case user will want to hit EDIT button again
    this.updateDataItem.emit(fullItem);

    // update user entity in state
    this.store_people.dispatch(
      new fromUsersActions.UpdateOneUser(fullItem.ID, fullItem)
    );

    // function that checks if anything left to save
    // if yes, it will run save workflows
    // if not, then switch mode to view
    this.finalize();
  }

  getAllFieldsOfUpdatedItemError(error) {
    this.savingChanges = false;
    console.log(error);
    this.store_root.dispatch(new fromErrorActions.DisplayError(error));
  }

  // * error when saving updated fields
  saveChangesFieldsError(error) {
    console.log("error when updating people item");
    this.savingChanges = false;
    // this.$onSaveChanges.unsubscribe();
    this.store_root.dispatch(new fromErrorActions.DisplayError(error));
  }

  saveNewPhoto(unsavedPhoto: ToSaveUserPhoto) {
    console.log(unsavedPhoto);
    this.$saveNewPhoto = this.spHttp
      .saveNewPhoto(unsavedPhoto)
      .subscribe(
        success => this.saveNewPhotoSuccess(success),
        error => console.log(error),
        () => console.log("completed")
      );
  }

  saveNewPhotoSuccess(newPhoto: SpListItemAttachmentFiles[]) {
    this.$saveNewPhoto.unsubscribe();
    this.updateFormGroupPhoto.emit(this.modifyNewPhotoObject(newPhoto));
    this.hasUnsavedPhoto = false;
    this.finalize();

    const changes: PeopleItem = {
      Attachments: true,
      AttachmentFiles: {
        results: this.modifyNewPhotoObject(newPhoto)
      }
    };
    this.store_people.dispatch(
      new fromUsersActions.UpdateOneUser(this.initialFields.id, changes)
    );
  }

  modifyNewPhotoObject(newPhoto: SpListItemAttachmentFiles[]) {
    // time is added to url to push browser to show updated photo
    const url = newPhoto[0].ServerRelativeUrl + "?time=" + Date.now();
    return [
      { ...newPhoto[0], ServerRelativeUrl: url }
    ] as SpListItemAttachmentFiles[];
  }

  finalize() {
    if (this.hasUnsavedFields || this.hasUnsavedPhoto) {
      this.savingChanges = true;
      this.saveNewPhoto(this.fg_photo.value);
    } else {
      this.savingChanges = false;
      this.switchFormMode.emit("view");
    }
  }

  ngOnDestroy() {
    this.$watchArrayBuffer.unsubscribe();
    console.log('people-form-actions-edit component: "destroyed"');
  }
}
