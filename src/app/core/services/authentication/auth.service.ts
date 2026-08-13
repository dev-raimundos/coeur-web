import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '@shared/models/login/login-request.model';
import { User } from '@shared/models/user.model';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _loginUrl = '/api/v1/auth/login';
    private readonly _logoutUrl = '/api/v1/auth/logout';
    private readonly _meUrl = '/api/v1/auth/me';
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

    /**
     * Busca os dados do usuário autenticado no backend, usando o cookie de sessão.
     * Nunca propaga erro: se o cookie não existir ou tiver expirado, apenas marca
     * o usuário como deslogado, o que é o comportamento esperado no bootstrap da app.
     * @returns Observable<User | null>
     */
    public fetchCurrentUser(): Observable<User | null> {
        this._isUserProfileLoading.set(true);
        return this._http.get<User>(this._meUrl).pipe(
            tap((user) => {
                this._currentUser.set(user);
                this._isLoggedIn.set(true);
            }),
            catchError(() => {
                this._currentUser.set(null);
                this._isLoggedIn.set(false);
                return of(null);
            }),
            finalize(() => this._isUserProfileLoading.set(false)),
        );
    }

    /**
     * Realiza o login do usuário, dado email e senha. O backend devolve o usuário no
     * corpo da resposta e o token num cookie HttpOnly (Set-Cookie) — não há token pra
     * armazenar manualmente aqui.
     * @param dto
     * @returns Observable<User>
     */
    public login(dto: LoginRequest): Observable<User> {
        this._isLoginLoading.set(true);
        return this._http.post<User>(this._loginUrl, dto).pipe(
            tap((user) => {
                this._currentUser.set(user);
                this._isLoggedIn.set(true);
            }),
            finalize(() => this._isLoginLoading.set(false)),
        );
    }

    /**
     * Efetua logout no backend (expira o cookie HttpOnly) e limpa o estado local.
     * Precisa chamar a API porque um cookie HttpOnly não pode ser removido via JS.
     */
    public logout(): void {
        this._http
            .post(this._logoutUrl, {})
            .pipe(
                finalize(() => {
                    this._currentUser.set(null);
                    this._isLoggedIn.set(false);
                    this._router.navigate(['/login']);
                }),
            )
            .subscribe();
    }
}
