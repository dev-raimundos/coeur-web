import { inject, Injectable, signal } from '@angular/core';
import { User } from '@shared/models/user.model';
import { defer, EMPTY, finalize, Observable } from 'rxjs';
import { RegisterUserRequest, UpdateUserRequest } from '../models/user-management.model';
import { UserService } from './user.service';

@Injectable()
export class UserFormService {
    private readonly _api = inject(UserService);
    private readonly _saving = signal(false);
    readonly saving = this._saving.asReadonly();

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
            return request().pipe(finalize(() => this._saving.set(false)));
        });
    }
}
