import { User } from './user.entity';
import { CourseSection } from './course-section.entity';
import { Enrollment } from './enrollment.entity';
import { CartItem } from './cart-item.entity';
import { Question } from './question.entity';
export declare class Course {
    id: number;
    title: string;
    description: string | null;
    instructorId: number;
    instructor: User;
    category: string | null;
    difficulty: string | null;
    price: string;
    thumbnailUrl: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    sections: CourseSection[];
    enrollments: Enrollment[];
    cartItems: CartItem[];
    questions: Question[];
}
