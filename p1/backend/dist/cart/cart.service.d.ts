import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Enrollment } from '../entities/enrollment.entity';
export declare class CartService {
    private cartRepo;
    private enrollmentRepo;
    constructor(cartRepo: Repository<CartItem>, enrollmentRepo: Repository<Enrollment>);
    findAll(userId: number): Promise<{
        id: number;
        course_id: number;
        course_title: string;
        price: number;
        added_at: Date;
    }[]>;
    add(userId: number, courseId: number): Promise<{
        success: boolean;
    }>;
    remove(userId: number, courseId: number): Promise<void>;
}
