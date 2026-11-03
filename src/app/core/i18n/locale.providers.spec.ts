import { formatDate, formatNumber } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { DatepickerIntlService } from '@shared/services/datepicker-intl.service';
import { provideBrazilianPortuguese } from './locale.providers';

describe('Brazilian Portuguese localization', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideBrazilianPortuguese(),
                provideNativeDateAdapter(),
                { provide: MatDatepickerIntl, useClass: DatepickerIntlService },
            ],
        });
    });

    it('formats dates and numbers according to Brazilian conventions', () => {
        const locale = TestBed.inject(LOCALE_ID);
        expect(locale).toBe('pt-BR');
        expect(formatDate(new Date(2026, 10, 3), 'shortDate', locale)).toBe('03/11/2026');
        expect(formatNumber(1234.5, locale, '1.2-2')).toBe('1.234,50');
    });

    it('translates calendar labels, month names and year ranges', () => {
        const intl = TestBed.inject(MatDatepickerIntl);
        const adapter = TestBed.inject(DateAdapter);
        expect(intl.openCalendarLabel).toBe('Abrir calendário');
        expect(intl.nextMonthLabel).toBe('Próximo mês');
        expect(intl.formatYearRangeLabel('2020', '2043')).toBe('2020 a 2043');
        expect(adapter.getMonthNames('long')[0]).toBe('janeiro');
        expect(adapter.getFirstDayOfWeek()).toBe(0);
    });
});
