import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { StorageService } from '@core/services/storage/storage.service';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'coeur-web:theme';
const DARK_CLASS = 'dark';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly _document = inject(DOCUMENT);
    private readonly _storage = inject(StorageService);

    private readonly _theme = signal<Theme>(this._readStoredTheme());
    public readonly theme = this._theme.asReadonly();

    constructor() {
        effect(() => this._applyTheme(this._theme()));
    }

    /**
     * Define o tema ativo e persiste a escolha em localStorage, pra manter a
     * preferência do usuário entre sessões.
     * @param theme
     */
    public setTheme(theme: Theme): void {
        this._theme.set(theme);
        this._storage.set(STORAGE_KEY, theme);
    }

    private _readStoredTheme(): Theme {
        return this._storage.get(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    }

    private _applyTheme(theme: Theme): void {
        this._document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
    }
}
