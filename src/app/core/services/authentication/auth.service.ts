import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginRequest } from '@shared/models/login/login-request.model';
import { LoginResponse } from '@shared/models/login/login-response.model';
import { User } from '@shared/models/user.model';
import { finalize, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _url = '/api/v1/auth/login';
    private readonly _http = inject(HttpClient);

    private readonly _isloginLoading = signal<boolean>(false);
    public readonly isLoginLoading = this._isloginLoading.asReadonly();

    private readonly _isLoggedIn = signal<boolean>(this.checkToken());
    public readonly isLoggedIn = this._isLoggedIn.asReadonly();

    private readonly _currentUser = signal<User | null>(null);
    public readonly currentUser = this._currentUser.asReadonly();

    private checkToken(): boolean {
        return !!localStorage.getItem('token');
    }

    private loadStoredUser(): User | null {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    }

    public storeSession(user: User, token: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
        this._isLoggedIn.set(true);
    }

    public login(dto: LoginRequest): Observable<LoginResponse> {
        this._isloginLoading.set(true);
        return this._http.get<LoginResponse>(this._url).pipe(
            tap(({ user, token }) => this.storeSession(user, token)),
            finalize(() => this._isloginLoading.set(false)),
        );
    }

    public logout() {
        localStorage.removeItem('token');
        this._isLoggedIn.set(false);
    }
}
