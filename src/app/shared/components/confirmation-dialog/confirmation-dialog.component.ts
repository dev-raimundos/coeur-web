import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmationDialogData {
    title: string;
    content: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

@Component({
    selector: 'app-confirmation-dialog',
    imports: [A11yModule, MatButtonModule, MatDialogModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
    public readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
}
