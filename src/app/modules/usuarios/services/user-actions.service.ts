import { inject, Injectable, signal } from '@angular/core';
import { User } from '@shared/models/user.model';
import { catchError, defer, EMPTY, finalize, Observable, throwError } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class UserActionsService {
    private readonly _api = inject(UserService);
    private readonly _loading = signal(false);
    private readonly _error = signal('');
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    loadUser(id: string): Observable<User> {
        return defer(() => {
            if (this._loading()) return EMPTY;
            this._loading.set(true);
            this._error.set('');
            return this._api.get(id).pipe(
                catchError((error: unknown) => {
                    this._error.set('Não foi possível carregar os dados do usuário. Tente novamente.');
                    return throwError(() => error);
                }),
                finalize(() => this._loading.set(false)),
            );
        });
    }
}
