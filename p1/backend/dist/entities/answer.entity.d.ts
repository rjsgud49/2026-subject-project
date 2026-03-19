import { Question } from './question.entity';
import { User } from './user.entity';
export declare class Answer {
    id: number;
    questionId: number;
    question: Question;
    userId: number;
    user: User;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}
