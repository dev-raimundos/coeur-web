import { Component, computed, inject, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/authentication/auth.service';
import { Theme, ThemeService } from '@core/services/theme/theme.service';

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
        MatMenuModule,
        RouterLink,
        RouterLinkActive,
        RouterOutlet
    ],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.scss',
})
export class ShellComponent {
    private readonly _authService = inject(AuthService);
    private readonly _themeService = inject(ThemeService);
    private readonly _breakpointObserver = inject(BreakpointObserver);

    opened = signal(true);
    currentUser = this._authService.currentUser;
    theme = this._themeService.theme;

    userInitials = computed(() => this._initialsOf(this.currentUser()?.name));
    userDisplayName = computed(() => this._firstAndLastNameOf(this.currentUser()?.name));

    isMobile = toSignal(
        this._breakpointObserver.observe(Breakpoints.Handset).pipe(
            map((result) => result.matches)
        ),
        { initialValue: false }
    );

    toggleSidenav() {
        this.opened.set(!this.opened());
    }

    setTheme(theme: Theme) {
        this._themeService.setTheme(theme);
    }

    logout() {
        this._authService.logout();
    }

    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Usuários', icon: 'people', route: '/usuarios' },
        { label: 'Configurações', icon: 'settings', route: '/config' },
    ];

    private _initialsOf(name: string | undefined): string {
        const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
        if (parts.length === 0) {
            return '';
        }
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    private _firstAndLastNameOf(name: string | undefined): string {
        const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
        return [parts[0], parts.length > 1 ? parts[parts.length - 1] : undefined].filter(Boolean).join(' ');
    }
}
