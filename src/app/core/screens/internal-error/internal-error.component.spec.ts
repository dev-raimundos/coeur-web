import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InternalErrorComponent } from './internal-error.component';

describe('InternalErrorComponent', () => {
    let component: InternalErrorComponent;
    let fixture: ComponentFixture<InternalErrorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InternalErrorComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(InternalErrorComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reload the page when retrying', () => {
        const reloadSpy = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ reload: reloadSpy } as unknown as Location);

        component.reload();

        expect(reloadSpy).toHaveBeenCalled();
    });
});
