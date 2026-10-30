import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { User } from '@shared/models/user.model';
import { UserService } from '../../services/user.service';
import { UserDialogComponent } from './user-dialog.component';
import { UserDialogData } from '../../models/user-dialog.model';

describe('UserDialogComponent', () => {
    const user: User = { id: '1', name: 'Ana', email: 'ana@example.com', roles: 'ROLE_USER' };
    const service = { create: vi.fn(), update: vi.fn() };
    const ref = { close: vi.fn(), disableClose: false };
    function setup(data: UserDialogData) {
        TestBed.configureTestingModule({
            imports: [UserDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: ref },
                { provide: UserService, useValue: service },
            ],
        });
        const fixture = TestBed.createComponent(UserDialogComponent);
        fixture.detectChanges();
        return fixture.componentInstance;
    }
    beforeEach(() => {
        vi.clearAllMocks();
        service.create.mockReturnValue(of(user));
        service.update.mockReturnValue(of(user));
        ref.disableClose = false;
    });

    it('rejects invalid name, email and password', () => {
        const component = setup({ mode: 'create' });
        component.form.patchValue({ name: '   ', email: 'invalid', password: '' });
        component.submit();
        expect(service.create).not.toHaveBeenCalled();
        expect(component.form.touched).toBe(true);
    });

    it('sends the password unchanged and does not send roles on creation', () => {
        const component = setup({ mode: 'create' });
        component.form.patchValue({ name: ' Ana ', email: user.email, password: ' secret ' });
        component.submit();
        expect(service.create).toHaveBeenCalledWith({ name: 'Ana', email: user.email, password: ' secret ' });
        expect(ref.close).toHaveBeenCalledWith(user);
    });

    it('edits roles without requiring or sending a password', () => {
        setup({ mode: 'edit', user }).submit();
        expect(service.update).toHaveBeenCalledWith('1', { name: user.name, email: user.email, roles: user.roles });
    });

    it('prevents double submission', () => {
        service.update.mockReturnValue(new Subject<User>());
        const component = setup({ mode: 'edit', user });
        component.submit();
        component.submit();
        expect(service.update).toHaveBeenCalledOnce();
        expect(ref.disableClose).toBe(true);
    });

    it('keeps the dialog open and marks conflicting email', () => {
        service.update.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
        const component = setup({ mode: 'edit', user });
        component.submit();
        expect(ref.close).not.toHaveBeenCalled();
        expect(component.form.controls.email.hasError('conflict')).toBe(true);
        expect(component.state.saving()).toBe(false);
        expect(ref.disableClose).toBe(false);
    });

    it('never submits the details view', () => {
        setup({ mode: 'details', user }).submit();
        expect(service.update).not.toHaveBeenCalled();
    });
});
