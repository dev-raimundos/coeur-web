import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
    override itemsPerPageLabel = 'Itens por página:';
    override nextPageLabel = 'Próxima página';
    override previousPageLabel = 'Página anterior';
    override firstPageLabel = 'Primeira página';
    override lastPageLabel = 'Última página';
    override getRangeLabel = (page: number, size: number, length: number): string =>
        length === 0
            ? '0 de 0'
            : `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}`;
}
