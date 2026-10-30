import { inject, Injectable, signal } from '@angular/core';
import { defer, EMPTY, finalize, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class DeleteUserService {
    private readonly _api = inject(UserService);
    private readonly _deleting = signal(false);
    readonly deleting = this._deleting.asReadonly();

    delete(id: string): Observable<void> {
        return defer(() => {
            if (this._deleting()) return EMPTY;
            this._deleting.set(true);
            return this._api.delete(id).pipe(finalize(() => this._deleting.set(false)));
        });
    }
}
