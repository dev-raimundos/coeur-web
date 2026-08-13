import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'coeur-web:theme';
const DARK_CLASS = 'dark';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly _document = inject(DOCUMENT);

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
        this._document.defaultView?.localStorage.setItem(STORAGE_KEY, theme);
        this._theme.set(theme);
    }

    private _readStoredTheme(): Theme {
        const stored = this._document.defaultView?.localStorage.getItem(STORAGE_KEY);
        return stored === 'dark' ? 'dark' : 'light';
    }

    private _applyTheme(theme: Theme): void {
        this._document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
    }
}
