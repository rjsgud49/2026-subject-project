import { CoursesService } from './courses.service';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(q?: string, category?: string, difficulty?: string, min_price?: string, max_price?: string, sort?: string, page?: string, size?: string): Promise<{
        items: {
            id: number;
            title: string;
            instructor_name: string;
            category: string | null;
            difficulty: string | null;
            price: number;
            thumbnail_url: string | null;
            created_at: Date;
        }[];
        total: number;
        page: number;
        size: number;
    }>;
    findOne(courseId: number): Promise<{
        id: number;
        title: string;
        description: string | null;
        instructor_id: number;
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
    }>;
}
