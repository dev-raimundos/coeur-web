import { UserRoleLabelPipe } from './user-role-label.pipe';

describe('UserRoleLabelPipe', () => {
    const pipe = new UserRoleLabelPipe();

    it.each([
        ['ROLE_USER', 'Usuário'],
        ['ROLE_ADMIN', 'Administrador'],
        ['admin', 'Administrador'],
        ['ROLE_USER, ROLE_ADMIN', 'Usuário, Administrador'],
        ['CUSTOM_ROLE', 'CUSTOM_ROLE'],
        [null, ''],
    ])('displays %s using its Portuguese label', (value, expected) => {
        expect(pipe.transform(value)).toBe(expected);
    });
});
