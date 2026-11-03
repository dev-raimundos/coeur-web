import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../app.routes';
import { OfflineComponent } from './offline.component';

describe('OfflineComponent', () => {
    beforeEach(() => {
        window.history.replaceState(null, '');
        TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.history.replaceState(null, '');
    });

    it('is accessible without authentication and explains the connection failure', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/offline', OfflineComponent);
        expect(harness.routeNativeElement?.textContent).toContain('Não foi possível conectar');
        expect(harness.routeNativeElement?.querySelector('button')?.textContent).toContain(
            'Tentar novamente',
        );
    });

    it.each([
        ['/usuarios?page=2', '/usuarios?page=2'],
        [undefined, '/'],
        ['/offline', '/'],
        ['//example.com', '/'],
        ['https://example.com', '/'],
        ['/\u005cexample.com', '/'],
    ])('retries using a local return URL: %s', (returnUrl, expected) => {
        window.history.replaceState({ returnUrl }, '');
        const component = TestBed.createComponent(OfflineComponent).componentInstance;
        const assign = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ assign } as unknown as Location);
        component.retry();
        expect(assign).toHaveBeenCalledWith(expected);
    });
});
