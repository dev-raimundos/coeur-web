import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Theme, ThemeService } from '@core/services/theme/theme.service';

@Component({
    selector: 'app-config',
    standalone: true,
    imports: [MatButtonToggleModule, MatIconModule],
    templateUrl: './config.component.html',
    styleUrl: './config.component.scss',
})
export class ConfigComponent {
    private readonly _themeService = inject(ThemeService);

    public theme = this._themeService.theme;

    public setTheme(theme: Theme): void {
        this._themeService.setTheme(theme);
    }
}
