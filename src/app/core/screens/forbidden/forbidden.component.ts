import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-forbidden',
    imports: [RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './forbidden.component.html',
    styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {}
