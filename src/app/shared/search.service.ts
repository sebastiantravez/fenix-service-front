import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppSettings } from 'app/enviroments';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  genericSearchApi: any[] = [
    { key: 'company', apiValue: '/v1/company/search' },
    { key: 'persons', apiValue: '/v1/persons/search' },
    { key: 'proyect', apiValue: '/v1/proyect/search' }
  ]

  constructor(private _httpClient: HttpClient,  public alertService: AlertService,) {
  }

  genericSearch(searchValue: string, apiKey: string): Observable<any[]> {
    const filterApiSearch = this.genericSearchApi.filter(api => api.key == apiKey)[0]
    return this._httpClient.get<any[]>(AppSettings.API_PATH + filterApiSearch.apiValue, { params: { searchValue } }).pipe(
      switchMap((response: any) => {
        if (response.length == 0) {
          return throwError('Empty data');
        }
        return of(response);
      }),
      catchError(error => {
        return throwError('Error connection api', error);
      })
    )
  }

}
