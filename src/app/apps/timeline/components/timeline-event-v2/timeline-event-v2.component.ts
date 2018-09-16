import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

// constants
import { ApiPath, PathSlbSp, PathOptimus } from '../../../../shared/constants';

// interfaces
import { TimelineEventItem } from '../../../../shared/interface/timeline.model';

@Component({
  selector: 'app-timeline-event-v2',
  styleUrls: ['timeline-event-v2.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper"
      fxLayout="row nowrap"
      fxLayoutAlign="start start">

      <app-timeline-event-reporters-v3
        class="reporters"
        [reportersId]="event?.EventReportersId?.results">
      </app-timeline-event-reporters-v3>

      <!-- Event -->
      <div class="event"
        fxLayout="row nowrap"
        fxLayoutAlign="start start"
        [ngClass]="{
          'issue-open': (event.EventType2 === 'Issue') && (event.IssueState === 'Open'),
          'issue-closed': (event.EventType2 === 'Issue') && (event.IssueState === 'Closed')
        }">

        <div class="details"
          [style.zIndex]="zIndexDetails"
          fxLayout="row wrap"
          fxLayoutAlign="start start"
          [ngClass]="{
            'has-photo': event.Attachments,
            'issue-open': (event.EventType2 === 'Issue') && (event.IssueState === 'Open'),
            'issue-closed': (event.EventType2 === 'Issue') && (event.IssueState === 'Closed')
            }">

          <div class="date-n-type"
            fxLayout="row nowrap"
            fxLayoutAlign="start start">

            <div class="date">{{ event.EventDate | date: 'mediumDate'}}</div>

            <div class="type"
              *ngIf="event.EventType2"
              fxLayout="row nowrap">
              <div class="middot">&middot;</div>
              <div>{{ event.EventType2 }}</div>
              <div *ngIf="event.EventType2 === 'Issue'">/{{ event.IssueState }}</div>
            </div>

          </div>

          <div class="title" (click)="openForm.emit(event)">
            {{ event.Title }}
          </div>

          <div class="summary" (click)="openForm.emit(event)">
            {{ event.Summary}}
          </div>

          <div class="followup"
            *ngIf="event.EventType2 === 'Issue'">
            {{ event.FollowUp }}
            <span class="followupby"> - follow up by {{ event.FollowUpBy.Fullname}} on {{ event.LastFollowUp | date: 'shortDate' }}</span>
          </div>

        </div>

        <div class="photo-container"
          *ngIf="event.Attachments"
          [style.zIndex]="zIndexPhoto"
          (click)="togglePhoto()"
          [ngClass]="{
            'issue-open': (event.EventType2 === 'Issue') && (event.IssueState === 'Open'),
            'issue-closed': (event.EventType2 === 'Issue') && (event.IssueState === 'Closed')
            }">
          <img class="photo" [src]="imageUrl">
        </div>

        <app-timeline-event-locations
          class="event-locations"
          [locations]="event?.Locations?.results">
        </app-timeline-event-locations>

      </div>

    </div>
    `
})
export class TimelineEventV2Component {
  @Input()
  event: TimelineEventItem;

  @Output()
  openForm = new EventEmitter<TimelineEventItem>();

  showPhoto: boolean;
  zIndexPhoto = 1;
  zIndexDetails = 2;

  // reportersWidth = '36px'; // default width for 1 reporter

  constructor(private cd: ChangeDetectorRef) {}

  // calcReportersWidth(quantity: number) {
  //   const width = 18 + quantity * 18;
  //   this.reportersWidth = width.toString() + 'px';
  //   this.cd.detectChanges();
  // }

  get imageUrl() {
    let path = '';
    if (this.event.Attachments) {
      path = this.event.AttachmentFiles.results[0].ServerRelativeUrl;
      return ApiPath.startsWith('_') ? `${PathSlbSp}`.concat(path) : path;
    } else {
      return path;
    }
  }

  togglePhoto() {
    if (!this.showPhoto) {
      this.showPhoto = true;
      this.zIndexPhoto = 2;
      this.zIndexDetails = 1;
    } else if (this.showPhoto) {
      this.showPhoto = false;
      this.zIndexPhoto = 1;
      this.zIndexDetails = 2;
    }
  }
}