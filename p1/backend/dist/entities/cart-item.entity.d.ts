import { User } from './user.entity';
import { Course } from './course.entity';
export declare class CartItem {
    id: number;
    userId: number;
    user: User;
    courseId: number;
    course: Course;
    addedAt: Date;
}
