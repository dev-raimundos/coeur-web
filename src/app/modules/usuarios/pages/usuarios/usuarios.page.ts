import { Component } from '@angular/core';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { UserActionsService } from '../../services/user-actions.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-usuarios-page',
    imports: [UserListComponent],
    providers: [UserService, UserActionsService],
    template: '<app-user-list />',
})
export class UsuariosPage {}
