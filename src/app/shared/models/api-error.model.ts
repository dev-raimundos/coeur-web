export interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
    detail?: string;
    title?: string;
    toast?: { message?: string; type?: 'error' | 'warning' | 'info' };
}
