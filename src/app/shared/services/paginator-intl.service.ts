import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl {
    public override itemsPerPageLabel = 'Itens por página:';
    public override nextPageLabel = 'Próxima página';
    public override previousPageLabel = 'Página anterior';
    public override firstPageLabel = 'Primeira página';
    public override lastPageLabel = 'Última página';
    public override getRangeLabel = (page: number, size: number, length: number): string =>
        length === 0
            ? '0 de 0'
            : `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}`;
}
