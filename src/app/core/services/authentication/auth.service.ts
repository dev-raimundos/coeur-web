import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '@shared/models/login/login-request.model';
import { LoginResponse } from '@shared/models/login/login-response.model';
import { User } from '@shared/models/user.model';
import { finalize, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _loginUrl = '/api/v1/auth/login';
    private readonly _meUrl = '/api/v1/auth/login/me';
    private readonly _http = inject(HttpClient);
    private readonly _router = inject(Router);

    private readonly _isUserProfileLoading = signal<boolean>(false);
    public readonly isUserProfileLoading = this._isUserProfileLoading.asReadonly();

    private readonly _isloginLoading = signal<boolean>(false);
    public readonly isLoginLoading = this._isloginLoading.asReadonly();

    private readonly _isLoggedIn = signal<boolean>(this.checkToken());
    public readonly isLoggedIn = this._isLoggedIn.asReadonly();

    private readonly _currentUser = signal<User | null>(this.loadStoredUser());
    public readonly currentUser = this._currentUser.asReadonly();

    private checkToken(): boolean {
        return !!localStorage.getItem('token');
    }

    /**
     * Verifica se há dados de um usuário logado no localStorage
     * @returns User | null
     */
    private loadStoredUser(): User | null {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    }

    /**
     * Armazena o usuário logado e o token no localStorage
     * @param user
     * @param token
     */
    private storeSession(user: User, token: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
        this._isLoggedIn.set(true);
    }

    /**
     * Busca os dados do usuário autenticado no backend,
     * usando o token já salvo. Sincroniza o currentUser com o servidor.
     * @returns Observable<User>
     */
    public fetchCurrentUser(): Observable<User> {
        //TODO: o /me retorna apenas id, name e email. corrigir!
        return this._http.get<User>(this._meUrl).pipe(
            tap((user) => {
                localStorage.setItem('user', JSON.stringify(user));
                this._currentUser.set(user);
                this._isLoggedIn.set(true);
            }),
        );
    }

    /**
     * Realiza o login do usuário, dado email e senha
     * @param dto
     * @returns Observable<LoginResponse>
     */
    public login(dto: LoginRequest): Observable<LoginResponse> {
        this._isloginLoading.set(true);
        return this._http.post<LoginResponse>(this._loginUrl, dto).pipe(
            tap(({ user, token }) => this.storeSession(user, token)),
            finalize(() => this._isloginLoading.set(false)),
        );
    }

    /**
     * Limpa o localStorage
     */
    public logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this._currentUser.set(null);
        this._isLoggedIn.set(false);
        this._router.navigate(['/login']);
    }
}
