import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    private getUserId;
    findAll(req: any): Promise<{
        id: number;
        course_id: number;
        course_title: string;
        price: number;
        added_at: Date;
    }[]>;
    add(req: any, courseId: number): Promise<{
        success: boolean;
    }>;
    remove(req: any, courseId: number): Promise<void>;
}
