import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {

  constructor(private http: HttpClient, private userService: UserService) { }

  public BASE_URL(): string {
    return `${environment.apiUrl}/notification`;
  }

  public addPushSubscriber(sub: PushSubscription): Observable<void> {
    return this.http.post<void>(this.BASE_URL(), sub, { headers: { authorization: this.userService.staticLoginToken } });
  }
}
