import { User } from './user.entity';
import { Course } from './course.entity';
import { VideoProgress } from './video-progress.entity';
export declare class Enrollment {
    id: number;
    userId: number;
    user: User;
    courseId: number;
    course: Course;
    enrolledAt: Date;
    status: string;
    videoProgress: VideoProgress[];
}
