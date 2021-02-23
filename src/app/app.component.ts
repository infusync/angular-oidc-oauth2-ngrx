import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { checkAuth, selectIsAuthenticated, login, logout } from './store';
import { Observable } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  constructor(public oidcSecurityService: OidcSecurityService, private store: Store<any>) {}

  ngOnInit() {
    this.store.dispatch(checkAuth());

    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
  }

  login() {
    this.store.dispatch(login());
  }

  logout() {
    this.store.dispatch(logout());
  }

  refresh() {
    let accesstoken = this.oidcSecurityService.getToken();
    let accesstoken2 = this.oidcSecurityService.getRefreshToken();
    this.oidcSecurityService.forceRefreshSession().subscribe((result) => console.log(result));;
    console.log(accesstoken2);
    console.log(accesstoken);
    return accesstoken;
  }
}
