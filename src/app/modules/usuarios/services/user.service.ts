import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@shared/models/user.model';
import { RegisterUserRequest, UpdateUserRequest, UserPage } from '../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly _http = inject(HttpClient);
    private readonly _url = '/api/v1/users';

    list(page: number, size: number, sort: string) {
        const params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
        return this._http.get<UserPage>(this._url, { params });
    }

    get(id: string) {
        return this._http.get<User>(`${this._url}/${encodeURIComponent(id)}`);
    }

    create(request: RegisterUserRequest) {
        return this._http.post<User>(`${this._url}/register`, request);
    }

    update(id: string, request: UpdateUserRequest) {
        return this._http.put<User>(`${this._url}/${encodeURIComponent(id)}`, request);
    }

    delete(id: string) {
        return this._http.delete<void>(`${this._url}/${encodeURIComponent(id)}`);
    }
}
