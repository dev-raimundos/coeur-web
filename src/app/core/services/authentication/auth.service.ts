import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '@shared/models/login/login-request.model';
import { TokenResponse } from '@shared/models/auth/token-response.model';
import { User } from '@shared/models/user.model';
import { catchError, finalize, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';

const ACCESS_TOKEN_KEY = 'coeur.accessToken';
const REFRESH_TOKEN_KEY = 'coeur.refreshToken';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _loginUrl = '/api/v1/auth/login';
    private readonly _refreshUrl = '/api/v1/auth/refresh';
    private readonly _meUrl = '/api/v1/users/me';
    private readonly _http = inject(HttpClient);
    private readonly _router = inject(Router);

    private readonly _isUserProfileLoading = signal<boolean>(false);
    public readonly isUserProfileLoading = this._isUserProfileLoading.asReadonly();

    private readonly _isLoginLoading = signal<boolean>(false);
    public readonly isLoginLoading = this._isLoginLoading.asReadonly();

    private readonly _isLoggedIn = signal<boolean>(false);
    public readonly isLoggedIn = this._isLoggedIn.asReadonly();

    private readonly _currentUser = signal<User | null>(null);
    public readonly currentUser = this._currentUser.asReadonly();

    /** Renovação de token em andamento, compartilhada entre chamadas concorrentes que levem 401. */
    private _refreshInFlight$: Observable<TokenResponse> | null = null;

    public getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    public getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    /**
     * Busca os dados do usuário autenticado (GET /api/v1/users/me) usando o access token
     * guardado localmente. Sem token salvo, nem chama a API: já marca como deslogado.
     * Nunca propaga erro, o que é o comportamento esperado no bootstrap da app.
     * @returns Observable<User | null>
     */
    public fetchCurrentUser(): Observable<User | null> {
        if (!this.getAccessToken()) {
            this._currentUser.set(null);
            this._isLoggedIn.set(false);
            return of(null);
        }

        this._isUserProfileLoading.set(true);
        return this._http.get<User>(this._meUrl).pipe(
            tap((user) => {
                this._currentUser.set(user);
                this._isLoggedIn.set(true);
            }),
            catchError(() => {
                this._clearTokens();
                this._currentUser.set(null);
                this._isLoggedIn.set(false);
                return of(null);
            }),
            finalize(() => this._isUserProfileLoading.set(false)),
        );
    }

    /**
     * Realiza o login do usuário, dado email e senha. O backend devolve um par de
     * tokens JWT (access + refresh), guardados para autenticar as próximas chamadas
     * via header Authorization: Bearer (ver AuthTokenInterceptor).
     * @param dto
     * @returns Observable<User>
     */
    public login(dto: LoginRequest): Observable<User> {
        this._isLoginLoading.set(true);
        return this._http.post<TokenResponse>(this._loginUrl, dto).pipe(
            tap((tokens) => this._storeTokens(tokens)),
            switchMap(() => this._http.get<User>(this._meUrl)),
            tap((user) => {
                this._currentUser.set(user);
                this._isLoggedIn.set(true);
            }),
            finalize(() => this._isLoginLoading.set(false)),
        );
    }

    /**
     * Renova o par de tokens usando o refresh token guardado. Usado pelo
     * AuthTokenInterceptor ao receber 401; chamadas concorrentes compartilham a
     * mesma requisição de renovação em vez de disparar uma pra cada.
     */
    public refreshAccessToken(): Observable<TokenResponse> {
        if (this._refreshInFlight$) {
            return this._refreshInFlight$;
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available.'));
        }

        this._refreshInFlight$ = this._http.post<TokenResponse>(this._refreshUrl, { refreshToken }).pipe(
            tap((tokens) => this._storeTokens(tokens)),
            finalize(() => (this._refreshInFlight$ = null)),
            shareReplay(1),
        );

        return this._refreshInFlight$;
    }

    /**
     * Logout local: a API não expõe endpoint de revogação de sessão (tokens JWT são
     * stateless), então basta descartar os tokens guardados e redirecionar ao login.
     */
    public logout(): void {
        this._clearTokens();
        this._currentUser.set(null);
        this._isLoggedIn.set(false);
        void this._router.navigate(['/login']);
    }

    private _storeTokens(tokens: TokenResponse): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    private _clearTokens(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
}
