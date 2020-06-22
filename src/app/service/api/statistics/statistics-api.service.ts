import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticsApiService {

  constructor(
    private http: HttpClient,
  ) { }

  public BASE_STATISTICS_GET_URL(): string {
    return `${environment.apiUrl}`;
  }

  public BASE_STATISTICS_OPTIONS_URL(): string {
    return this.BASE_STATISTICS_GET_URL();
  }

  public getBaseStatistics(): Observable<any> {
    return this.http.get(this.BASE_STATISTICS_GET_URL());
  }

  public getBaseAppStatistics(): Observable<any> {
    return this.http.get(`${environment.libUrl}/statistics`);
  }

  public optionsBaseStatistics(): Observable<void> {
    return this.http.options<void>(this.BASE_STATISTICS_OPTIONS_URL());
  }
}
