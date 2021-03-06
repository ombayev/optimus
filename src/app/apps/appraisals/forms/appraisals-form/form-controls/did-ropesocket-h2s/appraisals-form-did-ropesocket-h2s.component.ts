import { FormMode } from './../../../../../../shared/interface/form.model';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-appraisals-form-did-ropesocket-h2s',
  styleUrls: ['appraisals-form-did-ropesocket-h2s.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [formGroup]="fg_fields" fxFlex="100">
      <mat-checkbox formControlName="DidRopeSocketH2S" color="primary" [disabled]="disabled">
        <div class="appraisal-skill-description">Prepared RopeSocket (H2S)</div>
      </mat-checkbox>
    </div>
  `
})
export class AppraisalsFormDidRopeSocketH2SComponent implements OnChanges {
  @Input() fg_fields: FormGroup;
  @Input() mode: FormMode;

  disabled: boolean;
  formControl = 'DidRopeSocketH2S';

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    // react to form mode changes
    if (changes.mode.currentValue) {
      // check if mode is different
      if (changes.mode.previousValue !== changes.mode.currentValue) {
        this.onModeChange(changes.mode.currentValue);
      }
    }
  }

  onModeChange(newMode: FormMode) {
    console.log('new mode is: ' + newMode);
    if (newMode === 'view') {
      this.disabled = true;
    } else if (newMode === 'new') {
      this.disabled = false;
      this.fg_fields.controls['DidRopeSocketH2S'].patchValue(false);
    } else if (newMode === 'edit') {
      this.disabled = false;
    }
  }

  get hasError() {
    return this.fg_fields.get('DidRopeSocketH2S').invalid;
  }

  get errorMessage() {
    const control = this.fg_fields.controls['DidRopeSocketH2S'];

    const required = control.hasError('required');

    return control.touched ? (required ? '... is required' : '') : '';
  }
}
