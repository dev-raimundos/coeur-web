import { RegisterUserDTO } from './register-user.dto';
import { UpdateUserDTO } from './update-user.dto';
import { User } from '@shared/models/user.model';

export type UserDialogData = { mode: 'create' } | { mode: 'edit' | 'details'; user: User };

export type UserDialogResult = RegisterUserDTO | UpdateUserDTO;
