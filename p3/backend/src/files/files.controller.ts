import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { UPLOAD_ROOT } from '../upload.constants';

@Controller('files')
export class FilesController {
  @Get(':name')
  getFile(@Param('name') name: string, @Res() res: Response) {
    if (!/^[\w.-]+$/.test(name)) {
      throw new NotFoundException();
    }
    const abs = resolve(join(UPLOAD_ROOT, name));
    if (!abs.startsWith(resolve(UPLOAD_ROOT))) {
      throw new NotFoundException();
    }
    if (!existsSync(abs)) {
      throw new NotFoundException();
    }
    return res.sendFile(abs);
  }
}
