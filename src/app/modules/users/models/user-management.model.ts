import { User } from '@shared/models/user.model';

export interface UserPage {
    content: User[];
    totalElements: number;
}

export interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    name: string;
    email: string;
    roles: string;
}

export interface DeleteUserRequest {
    id: string;
}
