import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService, ToastType } from '../services/notification/toast/toast.service';

interface ApiError {
    detail?: string;
    title?: string;
    toast?: { message?: string; type?: ToastType };
}

const notifiedErrors = new WeakSet<HttpErrorResponse>();
const FALLBACK_MESSAGE = 'Não foi possível completar a operação. Tente novamente.';
const OFFLINE_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão.';

// Authentication handles 401 responses. Report other failures once, including refresh failures.
export const HttpErrorInterceptor: HttpInterceptorFn = (request, next) => {
    const toast = inject(ToastService);
    return next(request).pipe(
        catchError((error: unknown) => {
            if (
                error instanceof HttpErrorResponse &&
                error.status !== 401 &&
                !notifiedErrors.has(error)
            ) {
                notifiedErrors.add(error);
                const body: ApiError | null = typeof error.error === 'object' ? error.error : null;
                const message = [body?.toast?.message, body?.detail, body?.title].find(
                    (value) => typeof value === 'string' && value.trim().length > 0,
                );
                const type = body?.toast?.type;
                toast.show(
                    error.status === 0 ? OFFLINE_MESSAGE : (message ?? FALLBACK_MESSAGE),
                    type === 'warning' || type === 'info' ? type : 'error',
                );
            }
            return throwError(() => error);
        }),
    );
};
