import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiUrlInterceptor } from './core/interceptors/api-url.interceptor';
import { HttpErrorInterceptor } from './core/interceptors/http-error-toast.interceptor';
import { AuthService } from './core/services/authentication/auth.service';
import { ThemeService } from './core/services/theme/theme.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        // Usa Material Symbols (sucessor do Material Icons) como fonte de ícones padrão.
        { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
        provideHttpClient(withInterceptors([ApiUrlInterceptor, HttpErrorInterceptor])),
        // Resolve isLoggedIn/currentUser via /me antes da navegação inicial, já que o
        // cookie HttpOnly não pode ser lido diretamente pelo client pra checar a sessão.
        provideAppInitializer(() => inject(AuthService).fetchCurrentUser()),
        // Aplica o tema salvo antes da primeira renderização, pra evitar flash do tema padrão.
        provideAppInitializer(() => void inject(ThemeService)),
    ],
};
