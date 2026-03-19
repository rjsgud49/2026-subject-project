import { EnrollmentsService } from './enrollments.service';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    private getUserId;
    findAll(req: any, status?: string): Promise<{
        id: number;
        course_id: number;
        course_title: string;
        thumbnail_url: string;
        progress_percent: number;
        status: string;
        last_video_id: number | null;
        last_second: number | null;
    }[]>;
    enroll(req: any, courseId: number): Promise<{
        id: number;
    }>;
    findOne(req: any, enrollmentId: number): Promise<{
        id: number;
        course: {
            id: number;
            title: string;
            description: string | null;
            instructor_name: string;
            category: string | null;
            difficulty: string | null;
            price: number;
            thumbnail_url: string | null;
            sections: {
                id: number;
                title: string;
                sort_order: number;
                videos: {
                    id: number;
                    title: string;
                    video_url: string;
                    duration_seconds: number;
                    sort_order: number;
                }[];
            }[];
        };
        last_video_id: number | null;
        last_second: number | null;
        progress_percent: number;
    }>;
    getProgress(req: any, enrollmentId: number): Promise<{
        video_id: number;
        last_second: number;
        completed: boolean;
        updated_at: Date;
    }[]>;
    updateProgress(req: any, enrollmentId: number, videoId: number, body: {
        last_second?: number;
        completed?: boolean;
    }): Promise<{
        success: boolean;
    }>;
}
