import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageKey } from '../../../lib/enums/enums';
import { IMessage } from '../../../lib/interfaces/communication/IMessage';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardApiService {

  constructor(private http: HttpClient) { }

  public LEADERBOARD_GET_DATA_URL(quizName: string, amount: number, questionIndex?: number): string {
    return `${environment.apiUrl}/quiz/leaderboard/${encodeURIComponent(quizName)}/${encodeURIComponent(amount)}/${encodeURIComponent(
      questionIndex)}`;
  }

  public getLeaderboardData(quizName: string, amount: number, questionIndex?: number): Observable<IMessage> {
    return this.http.get<IMessage>(this.LEADERBOARD_GET_DATA_URL(quizName, amount, questionIndex),
      { headers: { authorization: sessionStorage.getItem(StorageKey.QuizToken) || sessionStorage.getItem(StorageKey.PrivateKey) } });
  }
}
