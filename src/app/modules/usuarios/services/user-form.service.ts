import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '@shared/models/user.model';
import { catchError, defer, EMPTY, finalize, Observable, throwError } from 'rxjs';
import { RegisterUserRequest, UpdateUserRequest } from '../models/user-management.model';
import { UserService } from './user.service';

@Injectable()
export class UserFormService {
    private readonly _api = inject(UserService);
    private readonly _saving = signal(false);
    private readonly _error = signal('');
    private readonly _emailConflict = signal(false);
    readonly saving = this._saving.asReadonly();
    readonly error = this._error.asReadonly();
    readonly emailConflict = this._emailConflict.asReadonly();

    create(request: RegisterUserRequest): Observable<User> {
        return this._save(() => this._api.create(request));
    }

    update(id: string, request: UpdateUserRequest): Observable<User> {
        return this._save(() => this._api.update(id, request));
    }

    private _save(request: () => Observable<User>): Observable<User> {
        return defer(() => {
            if (this._saving()) return EMPTY;
            this._saving.set(true);
            this._error.set('');
            this._emailConflict.set(false);
            return request().pipe(
                catchError((error: unknown) => {
                    const conflict = error instanceof HttpErrorResponse && error.status === 409;
                    this._emailConflict.set(conflict);
                    this._error.set(conflict
                        ? 'Este e-mail já está em uso. Informe outro e tente novamente.'
                        : 'Não foi possível salvar o usuário. Revise os dados e tente novamente.');
                    return throwError(() => error);
                }),
                finalize(() => this._saving.set(false)),
            );
        });
    }
}
