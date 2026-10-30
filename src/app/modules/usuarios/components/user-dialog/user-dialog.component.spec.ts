import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserDialogComponent } from './user-dialog.component';
import { UserDialogData } from '../../models/user-dialog.model';

describe('UserDialogComponent', () => {
    const user = { id: '1', name: 'Ana', email: 'ana@example.com', roles: 'ROLE_USER' };
    function setup(data: UserDialogData) {
        TestBed.configureTestingModule({
            imports: [UserDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
            ],
        });
        const fixture = TestBed.createComponent(UserDialogComponent);
        fixture.detectChanges();
        return fixture;
    }

    it('does not return invalid form data', () => {
        const fixture = setup({ mode: 'create' });
        fixture.componentInstance.form.patchValue({ name: '   ', email: 'invalid', password: '' });
        expect(fixture.componentInstance.result()).toBeUndefined();
    });

    it('returns a creation DTO with the password unchanged', () => {
        const fixture = setup({ mode: 'create' });
        fixture.componentInstance.form.patchValue({
            name: ' Ana ',
            email: user.email,
            password: ' secret ',
        });
        fixture.detectChanges();
        const button: HTMLButtonElement =
            fixture.nativeElement.querySelector('button[type=submit]');
        button.click();
        expect(TestBed.inject(MatDialogRef).close).toHaveBeenCalledWith({
            name: 'Ana',
            email: user.email,
            password: ' secret ',
            roles: 'ROLE_USER',
        });
    });

    it('returns the validated form values for editing', () => {
        const fixture = setup({ mode: 'edit', user });
        expect(fixture.componentInstance.result()).toEqual({
            name: user.name,
            email: user.email,
            roles: user.roles,
            password: '',
        });
    });

    it('does not return a mutation DTO from the details view', () => {
        expect(setup({ mode: 'details', user }).componentInstance.result()).toBeUndefined();
    });
});
