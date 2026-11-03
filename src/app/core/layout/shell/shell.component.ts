import { Component, computed, inject, signal } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntlService } from '@shared/services/paginator-intl.service';
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
import { UserInitialsPipe } from '@shared/pipes/user-initials.pipe';

@Component({
    selector: 'app-shell',
    providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntlService }],
    standalone: true,
    imports: [
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatMenuModule,
        UserInitialsPipe,
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
    ],
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.scss',
})
export class ShellComponent {
    private readonly _authService = inject(AuthService);
    private readonly _themeService = inject(ThemeService);
    private readonly _breakpointObserver = inject(BreakpointObserver);

    public opened = signal(!this._breakpointObserver.isMatched(Breakpoints.Handset));
    public currentUser = this._authService.currentUser;
    public theme = this._themeService.theme;

    public userDisplayName = computed(() => this._firstAndLastNameOf(this.currentUser()?.name));

    public isMobile = toSignal(
        this._breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
        { initialValue: false },
    );

    public toggleSidenav() {
        this.opened.set(!this.opened());
    }

    public setTheme(theme: Theme) {
        this._themeService.setTheme(theme);
    }

    public logout() {
        this._authService.logout();
    }

    public menuItems = [
        { label: 'Painel', icon: 'dashboard', route: '/dashboard' },
        { label: 'Usuários', icon: 'people', route: '/usuarios' },
        { label: 'Configurações', icon: 'settings', route: '/config' },
    ];

    private _firstAndLastNameOf(name: string | undefined): string {
        const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
        return [parts[0], parts.length > 1 ? parts[parts.length - 1] : undefined]
            .filter(Boolean)
            .join(' ');
    }
}
