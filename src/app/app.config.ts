import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiUrlInterceptor } from './core/interceptors/api-url.interceptor';
import { HttpErrorInterceptor } from './core/interceptors/http-error-toast.interceptor';
import { AuthService } from './core/services/authentication/auth.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        // Necessário pro MatSnackBar (usado pelo HttpErrorInterceptor) animar entrada/saída.
        provideAnimationsAsync(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([ApiUrlInterceptor, HttpErrorInterceptor])),
        // Resolve isLoggedIn/currentUser via /me antes da navegação inicial, já que o
        // cookie HttpOnly não pode ser lido diretamente pelo client pra checar a sessão.
        provideAppInitializer(() => inject(AuthService).fetchCurrentUser()),
    ],
};
