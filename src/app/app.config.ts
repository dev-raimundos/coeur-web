import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiUrlInterceptor } from './core/interceptors/api-url.interceptor';
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/authentication/auth.service';
import { ThemeService } from './core/services/theme/theme.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),
        { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
        provideHttpClient(
            withInterceptors([ApiUrlInterceptor, errorInterceptor, AuthTokenInterceptor]),
        ),
        provideAppInitializer(() => inject(AuthService).fetchCurrentUser()),
        provideAppInitializer(() => void inject(ThemeService)),
    ],
};
