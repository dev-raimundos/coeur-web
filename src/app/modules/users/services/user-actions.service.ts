import { inject, Injectable, signal } from '@angular/core';
import { User } from '@shared/models/user.model';
import { defer, EMPTY, finalize, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class UserActionsService {
    private readonly _api = inject(UserService);
    private readonly _loading = signal(false);
    readonly loading = this._loading.asReadonly();

    loadUser(id: string): Observable<User> {
        return defer(() => {
            if (this._loading()) return EMPTY;
            this._loading.set(true);
            return this._api.get(id).pipe(finalize(() => this._loading.set(false)));
        });
    }
}
