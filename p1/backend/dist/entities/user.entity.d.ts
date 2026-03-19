import { Enrollment } from './enrollment.entity';
import { CartItem } from './cart-item.entity';
import { Question } from './question.entity';
import { Answer } from './answer.entity';
export declare class User {
    id: number;
    email: string | null;
    name: string;
    passwordHash: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    enrollments: Enrollment[];
    cartItems: CartItem[];
    questions: Question[];
    answers: Answer[];
}
