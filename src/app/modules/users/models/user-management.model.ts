import { User } from '@shared/models/user.model';

export interface UserPage {
    content: User[];
    totalElements: number;
}

export interface DeleteUserRequest {
    id: string;
}
