import { Course } from './course.entity';
import { CourseVideo } from './course-video.entity';
export declare class CourseSection {
    id: number;
    courseId: number;
    course: Course;
    title: string;
    sortOrder: number;
    videos: CourseVideo[];
}
