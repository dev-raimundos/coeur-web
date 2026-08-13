import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type ToastType = 'error' | 'warning' | 'info';

const DURATION_MS = 5000;

const PANEL_CLASS_BY_TYPE: Record<ToastType, string> = {
    error: 'app-toast-error',
    warning: 'app-toast-warning',
    info: 'app-toast-info',
};

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private readonly _snackBar = inject(MatSnackBar);

    public error(message: string): void {
        this.show(message, 'error');
    }

    public warning(message: string): void {
        this.show(message, 'warning');
    }

    public info(message: string): void {
        this.show(message, 'info');
    }

    public show(message: string, type: ToastType): void {
        this._snackBar.open(message, 'Fechar', {
            duration: DURATION_MS,
            panelClass: PANEL_CLASS_BY_TYPE[type],
        });
    }
}
