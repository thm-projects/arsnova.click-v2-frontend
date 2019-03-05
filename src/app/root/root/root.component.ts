import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { DeprecatedDb, DeprecatedKeys } from '../../../lib/enums/enums';
import { INamedType } from '../../../lib/interfaces/interfaces';
// tslint:disable-next-line:max-line-length
import { QuizManagerDetailsOverviewComponent } from '../../quiz/quiz-manager/quiz-manager-details/quiz-manager-details-overview/quiz-manager-details-overview.component';
import { QuizManagerComponent } from '../../quiz/quiz-manager/quiz-manager/quiz-manager.component';
import { ConnectionService } from '../../service/connection/connection.service';
import { FooterBarService } from '../../service/footer-bar/footer-bar.service';
import { HeaderLabelService } from '../../service/header-label/header-label.service';
import { I18nService } from '../../service/i18n/i18n.service';
import { StorageService } from '../../service/storage/storage.service';
import { ThemesService } from '../../service/themes/themes.service';
import { TrackingService } from '../../service/tracking/tracking.service';
import { UserService } from '../../service/user/user.service';

// Update global window.* object interface (https://stackoverflow.com/a/12709880/7992104)
declare global {
  interface IWindow {
    cookieconsent?: {
      initialise: Function
    };
  }
}

declare interface IServerTarget {
  httpApiEndpoint: string;
  httpLibEndpoint: string;
  serverEndpoint: string;
  wsApiEndpoint: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit, AfterViewInit {
  public static TYPE = 'RootComponent';
  public isInQuizManager = false;

  private _isLoading = true;

  get isLoading(): boolean {
    return this._isLoading;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private connectionService: ConnectionService,
    public i18nService: I18nService, // Must be instantiated here to be available in all child components
    private trackingService: TrackingService,
    private footerBarService: FooterBarService,
    private headerLabelService: HeaderLabelService,
    private themesService: ThemesService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private userService: UserService,
    private swUpdate: SwUpdate,
    private toastService: ToastrService,
  ) {}

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Object.values(DeprecatedKeys).forEach(deprecatedKey => {
        localStorage.removeItem(deprecatedKey);
        sessionStorage.removeItem(deprecatedKey);
      });
      Object.values(DeprecatedDb).forEach(deprecatedDb => {
        indexedDB.deleteDatabase(deprecatedDb).addEventListener('success', () => {});
      });
    }

    this.userService.loadConfig();
    this.translateService.onLangChange.subscribe(() => {
      this.initializeCookieConsent();
      this.initializeUpdateToastr();
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof RouteConfigLoadStart) {
        this._isLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this._isLoading = false;
      }
    });
  }

  public ngAfterViewInit(): void {
    this.router.events.subscribe((nav: any) => {
      if (nav instanceof NavigationEnd) {

        if (isPlatformServer(this.platformId)) {
          return;
        }

        this.isInQuizManager = [QuizManagerComponent.TYPE, QuizManagerDetailsOverviewComponent.TYPE].includes(
          this.fetchChildComponent(this.activatedRoute).TYPE);
      }
    });
  }

  private fetchChildComponent(route: ActivatedRoute): INamedType {
    return <INamedType>(route.firstChild ? this.fetchChildComponent(route.firstChild) : route.component);
  }

  private initializeCookieConsent(): void {
    if (!(<IWindow>window).cookieconsent) {
      return;
    }

    const elements = document.getElementsByClassName('cc-window');
    for (let i = 0; i < elements.length; i++) {
      elements.item(i).remove();
    }

    (<IWindow>window).cookieconsent.initialise({
      palette: {
        popup: {
          background: '#1d8a8a',
        },
        button: {
          background: 'transparent',
          text: '#62ffaa',
          border: '#62ffaa',
        },
      },
      position: 'bottom-right',
      content: {
        message: this.translateService.instant('global.cookie_consent.message'),
        dismiss: this.translateService.instant('global.cookie_consent.dismiss'),
        link: this.translateService.instant('global.cookie_consent.learn_more'),
        href: 'dataprivacy',
      },
    });
  }

  private initializeUpdateToastr(): void {
    if (this.swUpdate.isEnabled) {
      let swUpdateToast: ActiveToast<any>;

      this.swUpdate.available.subscribe((event) => {
        console.log('service worker update available');
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        console.log('event type is', event.type);

        if (swUpdateToast) {
          this.toastService.remove(swUpdateToast.toastId);
        }

        const message = this.translateService.instant('component.toasts.swupdate.message');
        const title = this.translateService.instant('component.toasts.swupdate.title');
        swUpdateToast = this.toastService.info(message, title, {
          disableTimeOut: true,
          toastClass: 'toast show',
        });
        swUpdateToast.onTap.subscribe(() => {
          this.swUpdate.activateUpdate().then(() => document.location.reload());
        });

      });
      this.swUpdate.activated.subscribe(event => {
        console.log('previous version was', event.previous);
        console.log('current version is', event.current);
        console.log('event type is', event.type);
      });
      this.swUpdate.checkForUpdate().then(() => {
      }).catch((err) => {
        console.error('error when checking for update', err);
      });
    }
  }
}
