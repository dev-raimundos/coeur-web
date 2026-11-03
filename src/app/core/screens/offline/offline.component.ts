import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-offline',
    imports: [RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './offline.component.html',
    styleUrl: './offline.component.scss',
})
export class OfflineComponent {
    private readonly _router = inject(Router);
    private readonly _location = inject(Location);
    private readonly _returnUrl: unknown =
        this._router.currentNavigation()?.extras.state?.['returnUrl'] ??
        window.history.state?.returnUrl;

    public retry(): void {
        const returnUrl =
            typeof this._returnUrl === 'string' &&
            this._returnUrl.startsWith('/') &&
            !this._returnUrl.startsWith('//') &&
            !this._returnUrl.includes('\\') &&
            !/^\/(offline|internal-error|403)(?:[/?#]|$)/.test(this._returnUrl)
                ? this._returnUrl
                : '/';
        window.location.assign(this._location.prepareExternalUrl(returnUrl));
    }
}
