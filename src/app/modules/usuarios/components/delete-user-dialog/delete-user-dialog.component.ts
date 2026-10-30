import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DeleteUserDialogData } from '../../models/user-dialog.model';

@Component({
    selector: 'app-delete-user-dialog',
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './delete-user-dialog.component.html',
    styleUrl: './delete-user-dialog.component.scss',
})
export class DeleteUserDialogComponent {
    readonly data = inject<DeleteUserDialogData>(MAT_DIALOG_DATA);
    readonly result = { id: this.data.user.id };
}
