import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuizEntity } from '../../../lib/entities/QuizEntity';
import { DbTable } from '../../../lib/enums/enums';
import { MessageProtocol, StatusProtocol } from '../../../lib/enums/Message';
import { UserRole } from '../../../lib/enums/UserRole';
import { IMessage } from '../../../lib/interfaces/communication/IMessage';
import { QuizSaveComponent } from '../../modals/quiz-save/quiz-save.component';
import { QuizApiService } from '../../service/api/quiz/quiz-api.service';
import { ConnectionService } from '../../service/connection/connection.service';
import { FooterBarService } from '../../service/footer-bar/footer-bar.service';
import { HeaderLabelService } from '../../service/header-label/header-label.service';
import { QuizService } from '../../service/quiz/quiz.service';
import { StorageService } from '../../service/storage/storage.service';
import { TrackingService } from '../../service/tracking/tracking.service';
import { UserService } from '../../service/user/user.service';

@Component({
  selector: 'app-quiz-overview',
  templateUrl: './quiz-overview.component.html',
  styleUrls: ['./quiz-overview.component.scss'],
})
export class QuizOverviewComponent implements OnInit {
  public static TYPE = 'QuizOverviewComponent';
  public publicQuizAmount: number;

  private _sessions: Array<QuizEntity> = [];

  get sessions(): Array<QuizEntity> {
    return this._sessions;
  }

  private _isSaving: Array<number> = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private footerBarService: FooterBarService,
    private headerLabelService: HeaderLabelService,
    private quizService: QuizService,
    private router: Router,
    private trackingService: TrackingService,
    private quizApiService: QuizApiService,
    private storageService: StorageService,
    private userService: UserService,
    private modalService: NgbModal,
    public connectionService: ConnectionService,
  ) {

    this.footerBarService.TYPE_REFERENCE = QuizOverviewComponent.TYPE;
    footerBarService.replaceFooterElements([
      this.footerBarService.footerElemHome,
      this.footerBarService.footerElemAbout,
      this.footerBarService.footerElemTranslation,
      this.footerBarService.footerElemTheme,
      this.footerBarService.footerElemFullscreen,
      this.footerBarService.footerElemImport,
    ]);

    headerLabelService.headerLabel = 'component.name_management.session_management';

    this.quizApiService.getPublicQuizAmount().subscribe(val => {
      this.publicQuizAmount = val;
    });
  }

  public startQuiz(index: number): Promise<void> {
    return new Promise(async resolve => {
      if (isPlatformServer(this.platformId)) {
        resolve();
        return;
      }

      this.trackingService.trackClickEvent({
        action: QuizOverviewComponent.TYPE,
        label: `start-quiz`,
      });

      const quizAvailable = await this.requestQuizStatus(this.sessions[index]);
      if (!quizAvailable) {
        resolve();
        return;
      }

      this.quizService.quiz = this.sessions[index];
      this.quizService.isOwner = true;
      await this.openLobby(this.sessions[index]);

      resolve();
    });
  }

  public editQuiz(index: number): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.trackingService.trackClickEvent({
      action: QuizOverviewComponent.TYPE,
      label: `edit-quiz`,
    });

    this.quizService.quiz = this.sessions[index];
    this.quizService.isOwner = true;
    this.router.navigate(['/quiz', 'manager', 'overview']);
  }

  public async exportQuiz(index: number, onClick?: (self: HTMLAnchorElement, event: MouseEvent) => void): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const a = document.createElement('a');
    const time = new Date();
    const type = 'text/json';
    const sessionName = this.sessions[index].name;
    const exportData = `${type};charset=utf-8,${encodeURIComponent(JSON.stringify(this.sessions[index]))}`;
    const timestring = time.getDate() + '_' + (time.getMonth() + 1) + '_' + time.getFullYear();
    const fileName = `${sessionName}-${timestring}.json`;

    a.href = 'data:' + exportData;
    a.download = fileName;
    a.addEventListener<'click'>('click', function (this: HTMLAnchorElement, event: MouseEvent): void {
      if (onClick) {
        onClick(this, event);
      }
      if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(new Blob([exportData], { type }), fileName);
      }
    });
    a.innerHTML = '';
    a.click();

    this.trackingService.trackClickEvent({
      action: QuizOverviewComponent.TYPE,
      label: `export-quiz`,
    });
  }

  public async deleteQuiz(index: number): Promise<void> {
    this.trackingService.trackClickEvent({
      action: QuizOverviewComponent.TYPE,
      label: `delete-quiz`,
    });

    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.quizApiService.deleteQuiz(this.sessions[index]).subscribe((response: IMessage) => {
      if (response.status !== StatusProtocol.Success) {
        console.log(response);
      } else {
        const sessionName = this.sessions[index].name;
        this.sessions.splice(index, 1);
        this.storageService.delete(DbTable.Quiz, sessionName).subscribe();
      }
    });
  }

  public ngOnInit(): void {
    this.loadData();
  }

  public isSaved(index: number): boolean {
    return this._isSaving.includes(index);
  }

  public saveQuiz(index: number): void {
    if (this.isSaved(index)) {
      return;
    }

    this.trackingService.trackClickEvent({
      action: QuizOverviewComponent.TYPE,
      label: `save-quiz`,
    });

    this.modalService.open(QuizSaveComponent).result.catch(() => {}).then(val => {
      if (!val || new Date(val.expiry).getTime() <= new Date().getTime()) {
        return;
      }

      this.sessions[index].expiry = new Date(val.expiry);
      this.sessions[index].visibility = val.visibility;
      this.sessions[index].description = val.description;
      this._isSaving.push(index);
      this.quizApiService.putSavedQuiz(this.sessions[index]).subscribe(() => {
        this._isSaving.splice(this._isSaving.indexOf(index), 1);
      }, () => {
        this._isSaving.splice(this._isSaving.indexOf(index), 1);
      });
    });
  }

  public isAuthorizedToSaveQuiz(): boolean {
    return this.userService.isAuthorizedFor([UserRole.CreateExpiredQuiz, UserRole.SuperAdmin]);
  }

  private loadData(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.getAll(DbTable.Quiz).subscribe((rawSessions) => {
        rawSessions.forEach(session => {
          this._sessions.push(new QuizEntity(session.value));
        });
      });
    }
  }

  private async requestQuizStatus(session: QuizEntity): Promise<boolean> {
    const quizStatusResponse = await this.quizApiService.getQuizStatus(session.name).toPromise();
    if (quizStatusResponse.step === MessageProtocol.Available) {
      return true;
    }
    if (quizStatusResponse.step !== MessageProtocol.Unavailable) {
      return false;
    }

    const updatedQuiz = await this.quizApiService.setQuiz(session).toPromise();
    sessionStorage.setItem('token', updatedQuiz.adminToken);

    return true;
  }

  private async openLobby(session: QuizEntity): Promise<any> {
    this.quizApiService.setQuiz(session).subscribe((updatedQuiz) => {
      sessionStorage.setItem('token', updatedQuiz.adminToken);
      this.router.navigate(['/quiz', 'flow']);
    });
  }
}
