import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule, OidcConfigService } from 'angular-auth-oidc-client';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { appReducer, appEffects } from './store';
import { AppRoutingModule } from './app-routing.module';
import { ProtectedComponent } from './protected/protected.component';

export function configureAuth(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.withConfig({
      stsServer: 'https://identity.infusync.com',
      redirectUrl: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      clientId: 'InfusyncAppClient',
      scope: 'infusyncHMOApi openid profile offline_access',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
    });
}

@NgModule({
  declarations: [AppComponent, HomeComponent, UnauthorizedComponent, ProtectedComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot(),
    StoreModule.forRoot(appReducer),
    EffectsModule.forRoot(appEffects),
    HttpClientModule,
  ],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
