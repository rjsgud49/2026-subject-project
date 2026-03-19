import { Repository } from 'typeorm';
import { User } from '../entities';
export declare class AuthService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
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
    me(userId?: number): Promise<{
        id: number;
        email: string | null;
        name: string;
        role: string;
    }>;
}
