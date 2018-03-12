import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PeopleSearchUri } from './../../models/people-search-uri.model';

@Component({
  selector: 'app-people-toolbar-bottom',
  styleUrls: ['people-toolbar-bottom.component.css'],
  template: `
    <mat-toolbar-row class="toolbarForPaging">
      <div fxLayout="row" fxLayoutAlign="space-between center" fxFlexFill>

        <span class="footerButton">
          <button mat-icon-button *ngIf="uri?.__prev" (click)="onPrevClick()">
            <mat-icon>navigate_before</mat-icon>
          </button>
        </span>

        <span>Center</span>

        <span class="footerButton">
          <button mat-icon-button *ngIf="uri?.__next" (click)="onNextClick()">
            <mat-icon>navigate_next</mat-icon>
          </button>
        </span>

      </div>
    </mat-toolbar-row>
  `
})
export class PeopleToolbarBottomComponent {
  // buttons - disabled or enabled
  back = false;
  next = false;

  @Input() uri: PeopleSearchUri;

  @Output() onNext = new EventEmitter<any>();
  @Output() onPrev = new EventEmitter<any>();

  constructor() {}

  onPrevClick() {
    this.onPrev.emit(this.uri);
  }

  onNextClick() {
    this.onNext.emit();
  }
}
