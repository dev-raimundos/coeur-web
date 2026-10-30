import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DeleteUserService } from '../../services/delete-user.service';
import { DeleteUserDialogData } from '../../models/user-dialog.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-delete-user-dialog',
    imports: [MatDialogModule, MatButtonModule, MatProgressBarModule],
    providers: [DeleteUserService],
    templateUrl: './delete-user-dialog.component.html',
    styleUrl: './delete-user-dialog.component.scss',
})
export class DeleteUserDialogComponent {
    readonly state = inject(DeleteUserService);
    readonly data = inject<DeleteUserDialogData>(MAT_DIALOG_DATA);
    private readonly _ref = inject<MatDialogRef<DeleteUserDialogComponent, boolean>>(MatDialogRef);
    private readonly _destroyRef = inject(DestroyRef);

    confirm(): void {
        if (this.state.deleting()) return;
        this._ref.disableClose = true;
        this.state.delete(this.data.user.id).pipe(
            takeUntilDestroyed(this._destroyRef),
            finalize(() => { this._ref.disableClose = false; }),
        ).subscribe({
            next: () => this._ref.close(true),
            error: () => {},
        });
    }
}
