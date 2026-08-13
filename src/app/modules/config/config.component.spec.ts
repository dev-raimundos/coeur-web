import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Theme, ThemeService } from '@core/services/theme/theme.service';

import { ConfigComponent } from './config.component';

describe('ConfigComponent', () => {
    let component: ConfigComponent;
    let fixture: ComponentFixture<ConfigComponent>;
    let themeServiceMock: { theme: ReturnType<typeof signal<Theme>>; setTheme: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        themeServiceMock = {
            theme: signal<Theme>('light'),
            setTheme: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [ConfigComponent],
            providers: [{ provide: ThemeService, useValue: themeServiceMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reflect the current theme', () => {
        expect(component.theme()).toBe('light');
    });

    it('should delegate theme changes to the ThemeService', () => {
        component.setTheme('dark');

        expect(themeServiceMock.setTheme).toHaveBeenCalledWith('dark');
    });
});
