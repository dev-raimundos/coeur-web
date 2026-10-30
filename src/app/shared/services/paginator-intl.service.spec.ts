import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntlService } from './paginator-intl.service';

describe('PaginatorIntlService', () => {
    it('provides Portuguese labels and page ranges', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntlService }],
        });
        const intl = TestBed.inject(MatPaginatorIntl);
        expect(intl).toBeInstanceOf(PaginatorIntlService);
        expect(intl.itemsPerPageLabel).toBe('Itens por página:');
        expect(intl.nextPageLabel).toBe('Próxima página');
        expect(intl.getRangeLabel(0, 10, 25)).toBe('1–10 de 25');
        expect(intl.getRangeLabel(2, 10, 25)).toBe('21–25 de 25');
        expect(intl.getRangeLabel(0, 10, 0)).toBe('0 de 0');
    });
});
