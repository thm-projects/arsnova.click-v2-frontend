import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ITweetEntry } from '../../../lib/interfaces/ITweetEntry';

@Injectable({
  providedIn: 'root',
})
export class TwitterApiService {
  private _getTweetUrl: string;
  private _getQuestionDigestUrl: string;

  constructor(private http: HttpClient) {
    this.initUrls();
  }

  public getTweets(): Observable<ITweetEntry[]> {
    return this.http.get<ITweetEntry[]>(this._getTweetUrl);
  }

  public getQuestionImageDigest(html: string, theme: string): Observable<string> {
    return this.http.post<string>(this._getQuestionDigestUrl, {
      html,
      theme,
    });
  }

  private initUrls(): void {
    this._getTweetUrl = `${environment.apiUrl}/twitter/recentTweets`;
    this._getQuestionDigestUrl = `${environment.apiUrl}/image/quiz`;
  }
}
