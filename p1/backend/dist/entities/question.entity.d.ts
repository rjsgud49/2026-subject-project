import { Course } from './course.entity';
import { User } from './user.entity';
import { Answer } from './answer.entity';
export declare class Question {
    id: number;
    courseId: number;
    course: Course;
    userId: number;
    user: User;
    title: string;
    body: string;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    answers: Answer[];
}
