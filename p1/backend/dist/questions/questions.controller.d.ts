import { QuestionsService } from './questions.service';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    private getUserId;
    findByCourse(courseId: number, page?: string, size?: string): Promise<{
        items: {
            id: number;
            title: string;
            user_name: string;
            answer_count: number;
            created_at: Date;
        }[];
        total: number;
    }>;
    create(req: any, courseId: number, body: {
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
    update(req: any, questionId: number, body: {
        title?: string;
        body?: string;
    }): Promise<{
        success: boolean;
    }>;
    remove(req: any, questionId: number): Promise<void>;
    createAnswer(req: any, questionId: number, body: {
        body: string;
    }): Promise<{
        id: number;
    }>;
}
