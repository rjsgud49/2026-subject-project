import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
export interface CourseListQuery {
    q?: string;
    category?: string;
    difficulty?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    page?: number;
    size?: number;
}
export declare class CoursesService {
    private courseRepo;
    constructor(courseRepo: Repository<Course>);
    findAll(query: CourseListQuery): Promise<{
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
    findOne(id: number): Promise<{
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
