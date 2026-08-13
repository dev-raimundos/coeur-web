import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiUrlInterceptor } from './core/interceptor/api-url.interceptor';
import { AuthService } from './core/services/authentication/auth.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([ApiUrlInterceptor])),
        // Resolve isLoggedIn/currentUser via /me antes da navegação inicial, já que o
        // cookie HttpOnly não pode ser lido diretamente pelo client pra checar a sessão.
        provideAppInitializer(() => inject(AuthService).fetchCurrentUser()),
    ],
};
