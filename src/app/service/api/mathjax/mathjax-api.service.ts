import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IMathjaxResponse } from '../../../lib/interfaces/IMathjaxResponse';

@Injectable({
  providedIn: 'root',
})
export class MathjaxApiService {

  constructor(private http: HttpClient) { }

  public MATHJAX_POST_URL(): string {
    return `${environment.libUrl}/mathjax`;
  }

  public postMathjax(data: object): Observable<Array<IMathjaxResponse>> {
    return this.http.post<Array<IMathjaxResponse>>(this.MATHJAX_POST_URL(), data);
  }
}
