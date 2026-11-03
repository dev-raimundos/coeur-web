import { Pipe, PipeTransform } from '@angular/core';
import { USER_ROLE_OPTIONS } from '@shared/models/user-role.model';

@Pipe({ name: 'userRoleLabel' })
export class UserRoleLabelPipe implements PipeTransform {
    public transform(roles: string | null | undefined): string {
        if (!roles) return '';
        return roles
            .split(',')
            .map((role) => {
                const value = role.trim();
                const normalized = value.toUpperCase().replace(/^ROLE_/, '');
                return (
                    USER_ROLE_OPTIONS.find((option) => option.value === 'ROLE_' + normalized)
                        ?.label ?? value
                );
            })
            .join(', ');
    }
}
