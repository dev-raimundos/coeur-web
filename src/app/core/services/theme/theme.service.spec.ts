import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
    let service: ThemeService;
    let document: Document;

    beforeEach(() => {
        localStorage.clear();
        document = window.document;
        document.documentElement.classList.remove('dark');
    });

    function createService(): void {
        TestBed.configureTestingModule({
            providers: [{ provide: DOCUMENT, useValue: document }],
        });
        service = TestBed.inject(ThemeService);
        TestBed.tick();
    }

    it('should be created', () => {
        createService();
        expect(service).toBeTruthy();
    });

    it('should default to the light theme when nothing is stored', () => {
        createService();

        expect(service.theme()).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should restore a previously persisted theme', () => {
        localStorage.setItem('coeur-web:theme', 'dark');

        createService();

        expect(service.theme()).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should apply and persist the dark theme when set', () => {
        createService();

        service.setTheme('dark');
        TestBed.tick();

        expect(service.theme()).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('coeur-web:theme')).toBe('dark');
    });

    it('should apply and persist the light theme when set back', () => {
        localStorage.setItem('coeur-web:theme', 'dark');
        createService();

        service.setTheme('light');
        TestBed.tick();

        expect(service.theme()).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('coeur-web:theme')).toBe('light');
    });
});
