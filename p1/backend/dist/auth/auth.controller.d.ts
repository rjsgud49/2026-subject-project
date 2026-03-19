import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        id: number;
        email: string | null;
        name: string;
        role: string;
    }>;
    signup(body: {
        email: string;
        name: string;
        password: string;
    }): Promise<{
        id: number;
        email: string | null;
        name: string;
        role: string;
    }>;
    me(userId?: string): Promise<{
        id: number;
        email: string | null;
        name: string;
        role: string;
    }>;
}
