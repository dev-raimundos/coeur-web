import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env';

export const ApiUrlInterceptor: HttpInterceptorFn = (request, next) => {
    if (request.url.startsWith('/')) {
        const apiRequest = request.clone({
            url: `${environment.apiUrl}${request.url}`,
            withCredentials: true,
        });
        return next(apiRequest);
    }
    return next(request);
};
