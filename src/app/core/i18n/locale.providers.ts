import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders } from '@angular/core';

export function provideBrazilianPortuguese(): EnvironmentProviders {
    registerLocaleData(localePt, 'pt-BR');

    return makeEnvironmentProviders([{ provide: LOCALE_ID, useValue: 'pt-BR' }]);
}
