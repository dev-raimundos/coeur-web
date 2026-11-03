import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: 'offline',
        loadComponent: () =>
            import('./core/screens/offline/offline.component').then((m) => m.OfflineComponent),
    },
    {
        path: '403',
        loadComponent: () =>
            import('./core/screens/forbidden/forbidden.component').then(
                (m) => m.ForbiddenComponent,
            ),
    },
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./modules/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./core/layout/shell/shell.component').then((m) => m.ShellComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./modules/dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent,
                    ),
            },
            {
                path: 'usuarios',
                loadComponent: () =>
                    import('./modules/users/pages/users/users.page').then((m) => m.UsersPage),
            },
            {
                path: 'config',
                loadComponent: () =>
                    import('./modules/config/config.component').then((m) => m.ConfigComponent),
            },
        ],
    },
    {
        path: 'internal-error',
        loadComponent: () =>
            import('./core/screens/internal-error/internal-error.component').then(
                (m) => m.InternalErrorComponent,
            ),
    },
    {
        path: '**',
        loadComponent: () =>
            import('./core/screens/not-found/not-found.component').then((m) => m.NotFoundComponent),
    },
];
