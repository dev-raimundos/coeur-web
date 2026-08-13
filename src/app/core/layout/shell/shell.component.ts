import { Component, inject, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/authentication/auth.service';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        RouterLink,
        RouterLinkActive,
        RouterOutlet
    ],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.scss',
})
export class ShellComponent {
    private readonly _authService = inject(AuthService);
    private readonly _breakpointObserver = inject(BreakpointObserver);

    opened = signal(true);
    currentUser = this._authService.currentUser;

    isMobile = toSignal(
        this._breakpointObserver.observe(Breakpoints.Handset).pipe(
            map((result) => result.matches)
        ),
        { initialValue: false }
    );

    toggleSidenav() {
        this.opened.set(!this.opened());
    }

    logout() {
        this._authService.logout();
    }

    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Usuários', icon: 'people', route: '/usuarios' },
        { label: 'Configurações', icon: 'settings', route: '/config' },
    ];
}
