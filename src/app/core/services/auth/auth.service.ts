import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _isLoggedIn = signal<boolean>(this.checkToken());

    public readonly isLoggedIn = this._isLoggedIn.asReadonly();

    private checkToken(): boolean {
        return !!localStorage.getItem('token');
    }

    public login(token: string) {
        localStorage.setItem('token', token);
        this._isLoggedIn.set(true);
    }

    public logout() {
        localStorage.removeItem('token');
        this._isLoggedIn.set(false)
    }
}
