import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, throwError } from 'rxjs';
import { UserService } from '../../services/user.service';
import { DeleteUserDialogComponent } from './delete-user-dialog.component';

describe('DeleteUserDialogComponent', () => {
    const user = { id: '1', name: 'Ana', email: 'ana@example.com', roles: 'ROLE_USER' };
    const service = { delete: vi.fn() };
    const ref = { close: vi.fn(), disableClose: false };

    function setup() {
        TestBed.configureTestingModule({
            imports: [DeleteUserDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { user, isCurrentUser: true } },
                { provide: MatDialogRef, useValue: ref },
                { provide: UserService, useValue: service },
            ],
        });
        const fixture = TestBed.createComponent(DeleteUserDialogComponent);
        fixture.detectChanges();
        return fixture;
    }

    beforeEach(() => {
        vi.clearAllMocks();
        ref.disableClose = false;
    });

    it('warns about deleting your own account and waits for confirmation', () => {
        const fixture = setup();
        expect(fixture.nativeElement.textContent).toContain('sua própria conta');
        expect(service.delete).not.toHaveBeenCalled();
        const pending = new Subject<void>();
        service.delete.mockReturnValue(pending);
        fixture.componentInstance.confirm();
        fixture.componentInstance.confirm();
        expect(service.delete).toHaveBeenCalledExactlyOnceWith('1');
        expect(ref.disableClose).toBe(true);
        pending.next();
        pending.complete();
        expect(ref.close).toHaveBeenCalledWith(true);
    });

    it('allows retrying if deletion fails', () => {
        service.delete.mockReturnValue(throwError(() => new Error('server error')));
        const component = setup().componentInstance;
        component.confirm();
        expect(component.state.error()).toBeTruthy();
        expect(component.state.deleting()).toBe(false);
        expect(ref.disableClose).toBe(false);
        expect(ref.close).not.toHaveBeenCalled();
    });
});
