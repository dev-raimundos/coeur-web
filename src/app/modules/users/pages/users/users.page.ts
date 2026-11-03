import { Component } from '@angular/core';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-users-page',
    imports: [UserListComponent],
    providers: [UserService],
    template: '<app-user-list />',
})
export class UsersPage {}
