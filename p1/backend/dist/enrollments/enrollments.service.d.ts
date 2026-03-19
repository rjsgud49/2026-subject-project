import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { VideoProgress } from '../entities/video-progress.entity';
import { CourseVideo } from '../entities/course-video.entity';
import { CartItem } from '../entities/cart-item.entity';
export declare class EnrollmentsService {
    private enrollmentRepo;
    private progressRepo;
    private videoRepo;
    private cartRepo;
    constructor(enrollmentRepo: Repository<Enrollment>, progressRepo: Repository<VideoProgress>, videoRepo: Repository<CourseVideo>, cartRepo: Repository<CartItem>);
    findAll(userId: number, status?: string): Promise<{
        id: number;
        course_id: number;
        course_title: string;
        thumbnail_url: string;
        progress_percent: number;
        status: string;
        last_video_id: number | null;
        last_second: number | null;
    }[]>;
    getProgressPercent(enrollmentId: number): Promise<{
        percent: number;
    }>;
    findOne(enrollmentId: number, userId: number): Promise<{
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
    enroll(userId: number, courseId: number): Promise<{
        id: number;
    }>;
    getProgress(enrollmentId: number, userId: number): Promise<{
        video_id: number;
        last_second: number;
        completed: boolean;
        updated_at: Date;
    }[]>;
    upsertProgress(enrollmentId: number, userId: number, videoId: number, body: {
        last_second?: number;
        completed?: boolean;
    }): Promise<{
        success: boolean;
    }>;
}
