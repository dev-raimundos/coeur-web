/** Filtra retornos vazios ou falsos de diálogos; não valida a estrutura do DTO. */
export function isValidDto<T>(value: T | null | undefined): value is T {
    return !!value;
}
