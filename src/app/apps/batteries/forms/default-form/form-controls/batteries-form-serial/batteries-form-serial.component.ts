import { FormMode } from "../../../../../../shared/interface/form.model";
import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from "@angular/core";
import { FormGroup, FormControl, AbstractControl } from "@angular/forms";

@Component({
  selector: "app-batteries-form-serial",
  styleUrls: ["batteries-form-serial.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field fxFlex="100" [formGroup]="fg_fields">
      <input
        matInput
        placeholder="Serial Number"
        formControlName="Serial"
        autocomplete="off"
      />
      <mat-error *ngIf="hasError">{{ errorMessage }}</mat-error>
    </mat-form-field>
  `
})
export class BatteriesFormSerialComponent {
  @Input() fg_fields: FormGroup;
  @Input() mode: FormMode;

  constructor() {}

  get hasError() {
    return this.fg_fields.get("Serial").invalid;
  }

  get errorMessage() {
    const required = this.fg_fields.get("Serial").hasError("required");

    return this.fg_fields.get("Serial").touched
      ? required
        ? "Serial Number is required"
        : ""
      : "";
  }
}
