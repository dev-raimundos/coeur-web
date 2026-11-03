import { Injectable } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

@Injectable()
export class DatepickerIntlService extends MatDatepickerIntl {
    public override calendarLabel = 'Calendário';
    public override openCalendarLabel = 'Abrir calendário';
    public override closeCalendarLabel = 'Fechar calendário';
    public override prevMonthLabel = 'Mês anterior';
    public override nextMonthLabel = 'Próximo mês';
    public override prevYearLabel = 'Ano anterior';
    public override nextYearLabel = 'Próximo ano';
    public override prevMultiYearLabel = 'Período anterior';
    public override nextMultiYearLabel = 'Próximo período';
    public override switchToMonthViewLabel = 'Escolher data';
    public override switchToMultiYearViewLabel = 'Escolher mês e ano';
    public override startDateLabel = 'Data inicial';
    public override endDateLabel = 'Data final';
    public override comparisonDateLabel = 'Data de comparação';

    public override formatYearRangeLabel(start: string, end: string): string {
        return start + ' a ' + end;
    }
}
