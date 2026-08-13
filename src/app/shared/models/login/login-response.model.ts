import { User } from '@shared/models/user.model';

export interface LoginResponse {
    user: User;
    token: string;
}
