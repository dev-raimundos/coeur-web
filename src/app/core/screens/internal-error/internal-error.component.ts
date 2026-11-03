import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-internal-error',
    imports: [RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './internal-error.component.html',
    styleUrl: './internal-error.component.scss',
})
export class InternalErrorComponent {
    public reload(): void {
        window.location.reload();
    }
}
