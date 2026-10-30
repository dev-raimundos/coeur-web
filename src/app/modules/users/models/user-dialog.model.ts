import { RegisterUserRequest, UpdateUserRequest } from './user-management.model';
import { User } from '@shared/models/user.model';

export type UserDialogData = { mode: 'create' } | { mode: 'edit' | 'details'; user: User };

export type UserDialogResult = RegisterUserRequest & UpdateUserRequest;
