import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/authentication/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    private readonly _authService = inject(AuthService);
    currentUser = this._authService.currentUser;
}
