import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';

interface ActivityItem {
    icon: string;
    title: string;
    subtitle: string;
}

interface UserRow {
    name: string;
    email: string;
    role: string;
    status: 'Ativo' | 'Inativo';
}

const LOADING_SIMULATION_MS = 1800;

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatChipsModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatListModule,
        MatTableModule,
        MatExpansionModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDialogModule,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    private readonly _authService = inject(AuthService);
    private readonly _toast = inject(ToastService);
    private readonly _dialog = inject(MatDialog);
    private readonly _fb = inject(FormBuilder);

    @ViewChild('confirmDialog') private _confirmDialogTemplate!: TemplateRef<unknown>;

    currentUser = this._authService.currentUser;
    isLoading = signal(false);

    readonly categoryOptions = ['Geral', 'Bug', 'Melhoria', 'Urgente'];
    readonly planOptions = ['Básico', 'Pro', 'Enterprise'];
    readonly tagOptions = ['Frontend', 'Backend', 'Design', 'Mobile', 'API'];

    readonly displayedColumns = ['name', 'email', 'role', 'status'];
    readonly userRows: UserRow[] = [
        { name: 'Ana Silva', email: 'ana.silva@exemplo.com', role: 'Admin', status: 'Ativo' },
        { name: 'Bruno Costa', email: 'bruno.costa@exemplo.com', role: 'Editor', status: 'Ativo' },
        { name: 'Carla Souza', email: 'carla.souza@exemplo.com', role: 'Leitor', status: 'Inativo' },
        { name: 'Diego Alves', email: 'diego.alves@exemplo.com', role: 'Editor', status: 'Ativo' },
    ];

    readonly activityItems: ActivityItem[] = [
        { icon: 'person_add', title: 'Novo usuário cadastrado', subtitle: 'há 2 minutos' },
        { icon: 'edit', title: 'Perfil atualizado', subtitle: 'há 1 hora' },
        { icon: 'delete', title: 'Registro removido', subtitle: 'ontem' },
    ];

    form = this._fb.nonNullable.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        category: ['Bug', Validators.required],
        date: [null as Date | null],
        tags: [['Frontend'] as string[]],
        plan: ['Pro'],
        agree: [false, Validators.requiredTrue],
        notifications: [true],
        volume: [50],
    });

    submitForm(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this._toast.info(`Formulário enviado para ${this.form.getRawValue().name}.`);
        this.form.reset({ category: 'Bug', tags: ['Frontend'], plan: 'Pro', notifications: true, volume: 50 });
    }

    simulateLoading(): void {
        this.isLoading.set(true);
        setTimeout(() => {
            this.isLoading.set(false);
            this._toast.info('Operação concluída com sucesso!');
        }, LOADING_SIMULATION_MS);
    }

    openDialog(): void {
        this._dialog.open(this._confirmDialogTemplate);
    }
}
