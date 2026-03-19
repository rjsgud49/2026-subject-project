import { CourseSection } from './course-section.entity';
export declare class CourseVideo {
    id: number;
    sectionId: number;
    section: CourseSection;
    title: string;
    videoUrl: string;
    durationSeconds: number;
    sortOrder: number;
}
