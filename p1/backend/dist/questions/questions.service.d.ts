import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';
export declare class QuestionsService {
    private questionRepo;
    private answerRepo;
    constructor(questionRepo: Repository<Question>, answerRepo: Repository<Answer>);
    findByCourse(courseId: number, page?: number, size?: number): Promise<{
        items: {
            id: number;
            title: string;
            user_name: string;
            answer_count: number;
            created_at: Date;
        }[];
        total: number;
    }>;
    findOne(questionId: number): Promise<{
        question: {
            id: number;
            course_id: number;
            title: string;
            body: string;
            user_id: number;
            user_name: string;
            created_at: Date;
        };
        answers: {
            id: number;
            body: string;
            user_name: string;
            created_at: Date;
        }[];
    }>;
    create(courseId: number, userId: number, body: {
        title: string;
        body: string;
        is_private?: boolean;
    }): Promise<{
        id: number;
        course_id: number;
        title: string;
        body: string;
        user_id: number;
        user_name: string;
        created_at: Date;
    }>;
    update(questionId: number, userId: number, body: {
        title?: string;
        body?: string;
    }): Promise<{
        success: boolean;
    }>;
    remove(questionId: number, userId: number): Promise<void>;
    createAnswer(questionId: number, userId: number, body: {
        body: string;
    }): Promise<{
        id: number;
    }>;
}
