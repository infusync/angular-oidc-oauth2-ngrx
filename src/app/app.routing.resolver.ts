import { NgModule, Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService, Token } from 'angular-auth-oidc-client';
import { Observable, of, Subject } from 'rxjs';
import { takeWhile, skipWhile, takeUntil } from 'rxjs/operators';
import { AuthService } from './services/auth.service';


@Injectable()
export class AppRouteResolver implements Resolve<any> {
  token$: Observable<Token>;
  authenticated = false;
  token = '';
  retUrl = '';
  user$: Observable<Profile>;
  user: Profile;
  userRole$: Observable<any>;
  getEnrolleeId$: Observable<string>;
  tenantId$: Observable<any>;
  tenantId: any;
  destroy$: Subject<void> = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router,
    public securityService: AuthService,
  ) {
    this.token$ = this.store.select(getToken);
    this.token$
      .pipe(
        takeWhile(() => !this.authenticated),
        takeUntil(this.destroy$)
      )
      .subscribe((t) => {
        this.authenticated = t.authenticated;
        this.retUrl = t.retUrl;
      });

    this.user$ = this.store.select(getUser);
    this.user$.subscribe((result) => {
      this.user = result;
    });
    this.getEnrolleeId$ = this.store.select(getEnrolleeId);
    this.getEnrolleeId$.subscribe((result) => {
      this.enrolleeId = result;
    });
    this.tenantId$ = this.store.select(getTenantId);
    this.tenantId$.subscribe((result) => {
      this.tenantId = result;
    });

    this.userRole$ = this.store.select(getUserRole);
    this.userRole$
      .pipe(
        skipWhile((u) => !u),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        if (result === 'Staff' || result === 'Individual') {
          this.store.dispatch(
            new EnrolleeActions.LoadItemAction(this.enrolleeId)
          );
          this.store.dispatch(
            new HospitalsActions.LoadEnrolleeItemsAction(this.enrolleeId)
          );
        } else if (result === 'Super Administrators') {
          this.store.dispatch(new TenantActions.LoadItemAction(this.tenantId));
          this.store.dispatch(new SupportActions.LoadItemsAction(''));
          // this.store.dispatch(new TenantActions.LoadItemsAction(''));
        } else if (result === 'Administrators') {
          // this.store.dispatch(new CompanyActions.LoadItemsAction(''));
          this.store.dispatch(
            new MessagingActions.LoadCompanyItemsAction(this.user.companyId)
          );
          this.store.dispatch(
            new CompanyActions.LoadCompanyById(this.user.companyId)
          );
        }
      });
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (!this.securityService.IsAuthorized()) {
      this.securityService.Authorize(this.retUrl);
    }
    if (route.url[0].path === 'home' && this.authenticated) {
      if (this.retUrl && this.retUrl.length > 1) {
        this.router.navigate([this.retUrl]);
      }
    }
    return of(true);
  }
}
