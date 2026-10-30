import { inject, Injectable, signal } from '@angular/core';
import { catchError, defer, EMPTY, finalize, Observable, throwError } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class DeleteUserService {
    private readonly _api = inject(UserService);
    private readonly _deleting = signal(false);
    private readonly _error = signal('');
    readonly deleting = this._deleting.asReadonly();
    readonly error = this._error.asReadonly();

    delete(id: string): Observable<void> {
        return defer(() => {
            if (this._deleting()) return EMPTY;
            this._deleting.set(true);
            this._error.set('');
            return this._api.delete(id).pipe(
                catchError((error: unknown) => {
                    this._error.set('Não foi possível excluir o usuário. Tente novamente.');
                    return throwError(() => error);
                }),
                finalize(() => this._deleting.set(false)),
            );
        });
    }
}
