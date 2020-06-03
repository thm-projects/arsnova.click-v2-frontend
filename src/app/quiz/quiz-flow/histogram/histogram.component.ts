import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {IHasTriggeredNavigation} from '../../../lib/interfaces/IHasTriggeredNavigation';
import {distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import {QuizState} from '../../../lib/enums/QuizState';
import {isPlatformBrowser} from '@angular/common';
import {StorageKey} from '../../../lib/enums/enums';
import {ServerUnavailableModalComponent} from '../../../modals/server-unavailable-modal/server-unavailable-modal.component';
import {AttendeeService} from '../../../service/attendee/attendee.service';
import {QuizService} from '../../../service/quiz/quiz.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FooterBarService} from '../../../service/footer-bar/footer-bar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HeaderLabelService} from '../../../service/header-label/header-label.service';
import {ConnectionService} from '../../../service/connection/connection.service';
import {I18nService} from '../../../service/i18n/i18n.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {SimpleMQ} from 'ng2-simple-mq';
import {Subject} from 'rxjs';
import {MessageProtocol} from '../../../lib/enums/Message';
import {HistogramApiService} from '../../../service/api/histogram/histogram-api.service';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnDestroy, IHasTriggeredNavigation {

    get questionIndex(): number {
        return this._questionIndex;
    }

    get name(): string {
        return this._name;
    }

    public static readonly TYPE = 'HistogramComponent';

    private _questionIndex: number;
    private _serverUnavailableModal: NgbModalRef;
    private _name: string;

    private readonly _destroy = new Subject();
    private readonly _messageSubscriptions: Array<string> = [];

    public isLoadingData = true;
    public hasTriggeredNavigation: boolean;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        public attendeeService: AttendeeService,
        public quizService: QuizService,
        private sanitizer: DomSanitizer,
        private footerBarService: FooterBarService,
        private route: ActivatedRoute,
        private headerLabelService: HeaderLabelService,
        private router: Router,
        private connectionService: ConnectionService,
        private i18nService: I18nService,
        private histogramApiService: HistogramApiService,
        private ngbModal: NgbModal,
        private messageQueue: SimpleMQ,
    ) {
        this.footerBarService.TYPE_REFERENCE = HistogramComponent.TYPE;
    }

    public ngOnDestroy(): void {
        this.footerBarService.footerElemBack.restoreClickCallback();

        this._messageSubscriptions.forEach(id => this.messageQueue.unsubscribe(id));
        this._destroy.next();
        this._destroy.complete();
    }

    public ngOnInit(): void {
        this.quizService.quizUpdateEmitter.pipe(takeUntil(this._destroy)).subscribe(quiz => {
            if (!quiz) {
                return;
            }

            if (this.quizService.quiz.state === QuizState.Inactive) {
                this.hasTriggeredNavigation = true;
                this.router.navigate(['/']);
                return;
            }

            this._name = this.quizService.quiz.name;
            this.initData();
            this.addFooterElements();
        });

        if (isPlatformBrowser(this.platformId)) {
            this.quizService.loadDataToPlay(sessionStorage.getItem(StorageKey.CurrentQuizName)).then(() => {
                this.handleMessages();
            }).catch(() => this.hasTriggeredNavigation = true);
        }

        this.connectionService.serverStatusEmitter.pipe(takeUntil(this._destroy)).subscribe(isConnected => {
            if (isConnected) {
                if (this._serverUnavailableModal) {
                    this._serverUnavailableModal.dismiss();
                }
                return;
            } else if (!isConnected && this._serverUnavailableModal) {
                return;
            }

            this.ngbModal.dismissAll();
            this._serverUnavailableModal = this.ngbModal.open(ServerUnavailableModalComponent, {
                keyboard: false,
                backdrop: 'static',
            });
            this._serverUnavailableModal.result.finally(() => this._serverUnavailableModal = null);
        });
    }

    private initData(): void {

        this.route.paramMap.pipe(map(params => parseInt(params.get('questionIndex'), 10)), distinctUntilChanged(), takeUntil(this._destroy))
            .subscribe(questionIndex => {
                this._questionIndex = questionIndex;

                this.histogramApiService.getHistogramData(this.name, this.questionIndex).subscribe(histogramData => {
                    this.isLoadingData = false;
                });
            });
    }

    private addFooterElements(): void {
        const footerElements = [
            this.footerBarService.footerElemBack,
        ];

        this.footerBarService.footerElemBack.onClickCallback = () => {
            this.hasTriggeredNavigation = true;
            this.router.navigate(['/quiz', 'flow', 'results']);
        };

        this.footerBarService.replaceFooterElements(footerElements);
    }

    private handleMessages(): void {
        this._messageSubscriptions.push(...[
            this.messageQueue.subscribe(MessageProtocol.NextQuestion, payload => {
                this.quizService.quiz.currentQuestionIndex = payload.nextQuestionIndex;
                sessionStorage.removeItem(StorageKey.CurrentQuestionIndex);
            }),
            this.messageQueue.subscribe(MessageProtocol.Start, payload => {
                this.hasTriggeredNavigation = true;
                this.router.navigate(['/quiz', 'flow', 'voting']);
            }),
            this.messageQueue.subscribe(MessageProtocol.UpdatedResponse, payload => {
                console.log('LeaderboardComponent: modify response data for nickname', payload.nickname);
                this.attendeeService.modifyResponse(payload);
            }),
            this.messageQueue.subscribe(MessageProtocol.UpdatedSettings, payload => {
                this.quizService.quiz.sessionConfig = payload.sessionConfig;
            }),
            this.messageQueue.subscribe(MessageProtocol.Reset, payload => {
                this.attendeeService.clearResponses();
                this.quizService.quiz.currentQuestionIndex = -1;
                this.hasTriggeredNavigation = true;
                this.router.navigate(['/quiz', 'flow', 'lobby']);
            }),
            this.messageQueue.subscribe(MessageProtocol.Removed, payload => {
                const existingNickname = sessionStorage.getItem(StorageKey.CurrentNickName);
                if (existingNickname === payload.name) {
                    this.hasTriggeredNavigation = true;
                    this.router.navigate(['/']);
                }
            }),
            this.messageQueue.subscribe(MessageProtocol.Closed, payload => {
                this.hasTriggeredNavigation = true;
                this.router.navigate(['/']);
            }),
        ]);
    }
}
