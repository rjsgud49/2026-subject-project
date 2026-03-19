import { Enrollment } from './enrollment.entity';
import { CourseVideo } from './course-video.entity';
export declare class VideoProgress {
    id: number;
    enrollmentId: number;
    enrollment: Enrollment;
    videoId: number;
    video: CourseVideo;
    lastSecond: number;
    completed: boolean;
    updatedAt: Date;
}
