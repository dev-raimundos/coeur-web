import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(StorageService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('com localStorage disponível', () => {
        it('deve gravar e ler um valor', () => {
            service.set('chave', 'valor');

            expect(service.get('chave')).toBe('valor');
            expect(localStorage.getItem('chave')).toBe('valor');
        });

        it('deve retornar null quando a chave não existe', () => {
            expect(service.get('inexistente')).toBeNull();
        });

        it('deve remover uma chave', () => {
            service.set('chave', 'valor');

            service.remove('chave');

            expect(service.get('chave')).toBeNull();
        });

        it('não deve lançar erro se o setItem falhar (ex.: cota cheia)', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            expect(() => service.set('chave', 'valor')).not.toThrow();
        });
    });

    describe('sem defaultView (simulando SSR)', () => {
        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [{ provide: DOCUMENT, useValue: { defaultView: null } }],
            });
            service = TestBed.inject(StorageService);
        });

        it('get deve retornar null', () => {
            expect(service.get('chave')).toBeNull();
        });

        it('set e remove não devem lançar erro', () => {
            expect(() => service.set('chave', 'valor')).not.toThrow();
            expect(() => service.remove('chave')).not.toThrow();
        });
    });
});
