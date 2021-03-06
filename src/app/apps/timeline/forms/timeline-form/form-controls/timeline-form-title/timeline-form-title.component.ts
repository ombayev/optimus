import { FormMode } from './../../../../../../shared/interface/form.model';
import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-timeline-form-title',
  styleUrls: ['timeline-form-title.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field fxFlex="100" [formGroup]="fg_fields">
      <textarea matInput
        placeholder="Title"
        formControlName="Title"
        cdkTextareaAutosize
        #autosize="cdkTextareaAutosize"
        cdkAutosizeMaxRows="1"
        cdkAutosizeMaxRows="2">
      </textarea>
      <mat-hint align="end" *ngIf="mode !== 'view'">{{fg_fields.get('Title').value.length}} / 70</mat-hint>
      <mat-error *ngIf="hasError">{{ errorMessage }}</mat-error>
    </mat-form-field>
  `
})
export class TimelineFormTitleComponent {
  @Input() fg_fields: FormGroup;
  @Input() mode: FormMode;

  constructor() {}

  get hasError() {
    return this.fg_fields.get('Title').invalid;
  }

  get errorMessage() {
    const required = this.fg_fields.get('Title').hasError('required');

    return this.fg_fields.get('Title').touched
      ? required
        ? 'Title is required'
        : ''
      : '';
  }
}
