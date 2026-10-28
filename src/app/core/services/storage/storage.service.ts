import { DOCUMENT, inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private readonly _document = inject(DOCUMENT);

    private get _storage() {
        return this._document.defaultView?.localStorage;
    }

    public get(key: string) {
        return this._storage?.getItem(key) ?? null;
    }

    public set(key: string, value: string) {
        try {
            this._storage?.setItem(key, value);
        } catch {
            console.log("[STORAGE SERVICE] Storage cheio ou indisponível")
        }
    }

    public remove(key: string) {
        this._storage?.removeItem(key);
    }
}
