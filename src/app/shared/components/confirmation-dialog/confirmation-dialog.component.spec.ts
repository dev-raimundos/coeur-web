import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    const close = vi.fn();

    function render(data: ConfirmationDialogData) {
        TestBed.configureTestingModule({
            imports: [ConfirmationDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: { close } },
            ],
        });
        const fixture = TestBed.createComponent(ConfirmationDialogComponent);
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    }

    beforeEach(() => close.mockClear());

    it('renders supplied text safely and uses default button labels', () => {
        const host = render({ title: 'Confirmar ação?', content: '<strong>Conteúdo</strong>' });
        expect(host.querySelector('h2')?.textContent).toContain('Confirmar ação?');
        expect(host.querySelector('mat-dialog-content')?.textContent).toContain('<strong>Conteúdo</strong>');
        expect(host.querySelector('strong')).toBeNull();
        expect(host.textContent).toContain('Cancelar');
        expect(host.textContent).toContain('Confirmar');
        expect(close).not.toHaveBeenCalled();
    });

    it('returns false on cancellation and true only on confirmation', () => {
        const host = render({
            title: 'Excluir?', content: 'Esta ação é permanente.',
            cancelLabel: 'Voltar', confirmLabel: 'Excluir',
        });
        const buttons = host.querySelectorAll('button');
        expect(buttons[0].textContent).toContain('Voltar');
        expect(buttons[1].textContent).toContain('Excluir');
        expect(buttons[0].hasAttribute('cdkFocusInitial')).toBe(true);
        buttons[0].click();
        expect(close).toHaveBeenLastCalledWith(false);
        buttons[1].click();
        expect(close).toHaveBeenLastCalledWith(true);
    });
});
