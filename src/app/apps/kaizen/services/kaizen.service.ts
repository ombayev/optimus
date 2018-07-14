import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// rxjs
import { Observable, of, from } from 'rxjs';
import { map, mergeMap, switchMap, take } from 'rxjs/operators';

// constants
import { ApiPath, WirelinePath } from '../../../shared/constants';
import { hk_accept, hv_appjson } from '../../../shared/constants/headers';

// interfaces
import { KaizenSearchParams } from '../../../shared/interface/kaizen.model';
import { SpResponse } from '../../../shared/interface/sp-response.model';
import { SpGetListItemResult } from '../../../shared/interface/sp-list-item.model';

// services
import { SharepointService } from '../../../shared/services/sharepoint.service';

@Injectable()
export class KaizenService {
  constructor(private http: HttpClient, private sp: SharepointService) {}

  getDataWithGivenUrl(url) {
    return this.http
      .get(url, {
        headers: new HttpHeaders().set(hk_accept, hv_appjson)
      })
      .pipe(
        switchMap((response: SpResponse) => {
          // console.log(response);
          if (response.d.results) {
            return of(response);
          }
        })
      );
  }

  buildUrl(params: KaizenSearchParams, counter?: boolean) {
    // api url for NgTimeline
    let url = `${ApiPath}/web/lists/getbytitle('NgKaizen')/items?`;

    // parameters
    // # needs to be replaced, otherwise http request to sharepoint will through error
    const text = params.text.replace('#', '%23');
    const locations = params.locations;
    let top = params.top;

    // $select & $expand
    url += `$select=${this.getSelectFields().toString()}`;
    url += `&$expand=${this.getExpandFields().toString()}`;

    // $filter
    if (text || locations.length) {
      url += `&$filter=`;
    }

    if (text) {
      url += `(`;
      url += `(substringof('${text}',Title))`;
      url += `or(substringof('${text}',Summary))`;
      // url += `or(substringof('${text}',HashTags))`;
      url += `)`;
    }

    if (text && locations.length) {
      url += 'and';
    }

    if (locations.length) {
      url += `${this.getFilterLocations(locations)}`;
    }

    // $orderby
    url += `&$orderby=ProjectDate desc`;

    // $top
    if (top) {
      if (counter) {
        top = 500;
      }
      url += `&$top=${top}`;
    }

    // return combiner url string
    return url;
  }

  getSelectFields() {
    const $select = [
      'Id',
      'ID',
      'ProjectDate',
      'Title',
      'Summary',
      'ProjectTypeId',
      'ProjectType/Id',
      'ProjectType/Title',
      'ImpactTypeId',
      'ImpactType/Id',
      'ImpactType/Title',
      'ValueCreationForClient',
      'DoneById',
      'DoneBy/ID',
      'DoneBy/Alias',
      'DoneBy/Fullname',
      'LocationsId',
      'Locations/Id',
      'Attachments',
      'AttachmentFiles',
      'RichText',
      'QuestRIR',
      'QuestQPID',
      // 'HashTags',
      'Created'
    ];
    return $select.toString();
  }

  getExpandFields() {
    const $expand = [
      'AttachmentFiles',
      'ProjectType',
      'ImpactType',
      'DoneBy',
      'Locations'
    ];
    return $expand.toString();
  }

  getFilterLocations(locations: number[]) {
    if (locations.length) {
      let filter = '';
      const n = locations.length;
      let i = 1;

      for (const location of locations) {
        // if multiple locations then wrap them in brackets
        if (i === 1 && n > 1) {
          filter += `(`;
        }

        filter += `(Locations/Id eq ${location})`;

        // if current iteration is not last then add 'or'
        if (n > 1 && n !== i) {
          filter += `or`;
        }

        // if last then close brackets
        if (n > 1 && i === n) {
          filter += `)`;
        }

        i++;
      }

      return filter;
    }
  }
}
