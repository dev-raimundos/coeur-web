export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    isEmailVerified: string;
    createdAt: string;
    updatedAt: string | null;
    lastLoginAt: string | null;
}
