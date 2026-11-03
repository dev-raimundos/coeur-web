import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../app.routes';
import { ForbiddenComponent } from './forbidden.component';

describe('ForbiddenComponent', () => {
    it('shows access denied without an authentication redirect', async () => {
        TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/403', ForbiddenComponent);
        expect(harness.routeNativeElement?.textContent).toContain('Acesso negado');
        expect(harness.routeNativeElement?.querySelector('a')?.getAttribute('href')).toBe('/');
    });
});
