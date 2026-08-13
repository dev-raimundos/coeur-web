import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService, ToastType } from '../services/notification/toast/toast.service';

interface ProblemDetailsToast {
    type: ToastType;
    message: string;
}

const FALLBACK_MESSAGE = 'Não foi possível completar a operação. Tente novamente.';
const OFFLINE_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão.';

/**
 * exibe o que a API já manda em toda resposta Problem Details (extensão "toast",
 * ver CustomizeProblemDetails na API) — sem opção de customização por chamada. Um
 * component que precise de um toast próprio usa o ToastService diretamente.
 */
export const HttpErrorInterceptor: HttpInterceptorFn = (request, next) => {
    const toast = inject(ToastService);

    return next(request).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse) {
                const problemToast = (error.error as { toast?: ProblemDetailsToast } | null)?.toast;

                toast.show(
                    problemToast?.message ?? (error.status === 0 ? OFFLINE_MESSAGE : FALLBACK_MESSAGE),
                    problemToast?.type ?? 'error',
                );
            }

            return throwError(() => error);
        }),
    );
};
