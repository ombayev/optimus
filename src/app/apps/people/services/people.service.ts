import { SpResponse } from './../../../models/sp-response.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// rxjs
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// constants
import { ApiPath } from '../../../shared/constants';
import { hk_accept, hv_appjson } from '../../../shared/constants/headers';

// interfaces
import { PeopleParams } from './../models/people-params.model';

@Injectable()
export class PeopleService {
  constructor(private http: HttpClient) {}

  getPeopleWithGivenUrl(url) {
    return this.http
      .get(url, {
        headers: new HttpHeaders().set(hk_accept, hv_appjson)
      })
      .pipe(
        switchMap((response: SpResponse) => {
          console.log(response.d.results);
          if (response.d.results) {
            return of(response);
          }
        }),
        catchError((error: any) => throwError(error.json()))
      );
  }

  buildUrlToGetPeople(params: PeopleParams, counter?: boolean) {
    // api url for NgPeople
    let url = `${ApiPath}web/lists/getbytitle('NgPeople')/items`;

    // select only following fields
    let select =
      '?$select=Id,Alias,Name,Surname,Email,Gin,LocationAssignedId,Photo';

    // parameters
    const query = params.query;
    const location = params.location;
    let top = params.top;

    // to count total
    counter ? ((top = 500), (select = `?$select=Alias`)) : '';

    url += select;

    // $filter by following specific query
    if (query || location) {
      if (query || location !== 'Global') {
        url += `&$filter=`;
      }

      if (query) {
        url += `((substringof('${query}',Name))`;
        url += `or(substringof('${query}',Surname))`;
        url += `or(substringof('${query}',Alias))`;
        url += `or(substringof('${query}',Email))`;
        url += `or(substringof('${query}',Gin)))`;
      }

      if (query && location && location !== 'Global') {
        url += `and`;
      }

      if (location && location !== 'Global') {
        url += `(Location eq '${location}')`;
      }
    }

    // $orderby
    url += `&$orderby=Name asc`;

    // $top
    url += `&$top=${top}`;

    return url;
  }
}
