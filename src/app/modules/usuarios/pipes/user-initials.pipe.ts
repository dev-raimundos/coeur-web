import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'userInitials' })
export class UserInitialsPipe implements PipeTransform {
    transform(name: string): string {
        return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
            .map((part) => part[0]).join('').toUpperCase();
    }
}
