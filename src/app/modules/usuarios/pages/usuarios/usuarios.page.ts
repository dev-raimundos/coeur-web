import { Component } from '@angular/core';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { UserActionsService } from '../../services/user-actions.service';
import { UsersStateService } from '../../services/users-state.service';

@Component({
    selector: 'app-usuarios-page',
    imports: [UserListComponent],
    providers: [UsersStateService, UserActionsService],
    template: '<app-user-list />',
})
export class UsuariosPage {}
