import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'feedback');

function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  private getUserId(req: any): number {
    const id = req.headers['x-user-id'];
    return id ? parseInt(id, 10) : 1;
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(mp4|mov|pdf|docx|hwp|hwpx|zip)$/i;
        if (allowed.test(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new Error('허용되지 않는 파일 형식입니다.'), false);
        }
      },
    }),
  )
  async create(
    @Req() req: any,
    @Body() body: CreateFeedbackDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.feedbackService.create(this.getUserId(req), body, files ?? []);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.feedbackService.findAllByUser(this.getUserId(req));
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findOne(this.getUserId(req), id);
  }
}
