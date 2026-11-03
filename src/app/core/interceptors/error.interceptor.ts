import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '@shared/models/api-error.model';
import { ToastService } from '../services/notification/toast/toast.service';

const handledErrors = new WeakSet<HttpErrorResponse>();

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
    const notification = inject(ToastService);
    const router = inject(Router);
    const isSilent = request.headers.has('X-Silent');

    return next(request).pipe(
        catchError((error: unknown) => {
            if (!(error instanceof HttpErrorResponse) || isSilent || handledErrors.has(error)) {
                return throwError(() => error);
            }

            handledErrors.add(error);
            const apiError: ApiErrorResponse | null =
                typeof error.error === 'object' && error.error !== null ? error.error : null;
            const message = [
                apiError?.toast?.message,
                apiError?.message,
                apiError?.detail,
                apiError?.title,
            ].find((value) => typeof value === 'string' && value.trim().length > 0);
            const type = apiError?.toast?.type;

            switch (error.status) {
                case 0:
                    void router.navigate(['/offline'], {
                        state: { returnUrl: router.url },
                        replaceUrl: true,
                    });
                    break;

                // A renovação do token e o logout são tratados pelo AuthTokenInterceptor.
                case 401:
                    break;

                case 403:
                    void router.navigate(['/403']);
                    break;

                case 404:
                    notification.error(message ?? 'Recurso não encontrado.');
                    break;

                case 422: {
                    const firstError = apiError?.errors
                        ? Object.values(apiError.errors)
                              .flat()
                              .find((value) => typeof value === 'string' && value.trim().length > 0)
                        : undefined;
                    notification.error(
                        firstError ?? message ?? 'Dados inválidos. Verifique os campos.',
                    );
                    break;
                }

                case 429:
                    notification.error('Muitas tentativas. Aguarde alguns instantes.');
                    break;

                case 500:
                case 502:
                case 503:
                    void router.navigate(['/internal-error'], { replaceUrl: true });
                    break;

                default:
                    notification.show(
                        message ?? 'Não foi possível completar a operação. Tente novamente.',
                        type === 'warning' || type === 'info' ? type : 'error',
                    );
            }

            return throwError(() => error);
        }),
    );
};
