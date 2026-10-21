import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/authentication/auth.service';

const AUTH_FREE_URLS = ['/api/v1/auth/login', '/api/v1/auth/refresh'];

/**
 * Anexa o access token guardado como header Authorization: Bearer em toda requisição
 * (exceto login/refresh, que são públicas). Num 401, tenta renovar o token uma vez
 * (ver AuthService.refreshAccessToken) e repete a requisição original; se a renovação
 * falhar, desloga o usuário.
 */
export const AuthTokenInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);

    if (AUTH_FREE_URLS.some((url) => request.url.includes(url))) {
        return next(request);
    }

    const accessToken = authService.getAccessToken();
    const authRequest = accessToken ? _withBearer(request, accessToken) : request;

    return next(authRequest).pipe(
        catchError((error: unknown) => {
            if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !accessToken) {
                return throwError(() => error);
            }

            return authService.refreshAccessToken().pipe(
                switchMap((tokens) => next(_withBearer(request, tokens.accessToken))),
                catchError((refreshError: unknown) => {
                    authService.logout();
                    return throwError(() => refreshError);
                }),
            );
        }),
    );
};

function _withBearer(request: HttpRequest<unknown>, accessToken: string): HttpRequest<unknown> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
}
