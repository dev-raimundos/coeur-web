import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env';

export const ApiUrlInterceptor: HttpInterceptorFn = (request, next) => {
    if (request.url.startsWith('/')) {
        // withCredentials: true é necessário pro browser enviar (e aceitar) o cookie
        // HttpOnly do token, já que front e API estão em origens diferentes.
        const apiRequest = request.clone({
            url: `${environment.apiUrl}${request.url}`,
            withCredentials: true,
        });
        return next(apiRequest);
    }
    return next(request);
};
