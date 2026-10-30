import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteUserDialogComponent } from './delete-user-dialog.component';

describe('DeleteUserDialogComponent', () => {
    it('returns the selected user ID only when confirmed', () => {
        const ref = { close: vi.fn() };
        TestBed.configureTestingModule({
            imports: [DeleteUserDialogComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        user: { id: '1', name: 'Ana', email: 'ana@example.com' },
                        isCurrentUser: true,
                    },
                },
                { provide: MatDialogRef, useValue: ref },
            ],
        });
        const fixture = TestBed.createComponent(DeleteUserDialogComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('sua própria conta');
        expect(ref.close).not.toHaveBeenCalled();
        fixture.nativeElement.querySelector('.delete-button').click();
        expect(ref.close).toHaveBeenCalledWith({ id: '1' });
    });
});
