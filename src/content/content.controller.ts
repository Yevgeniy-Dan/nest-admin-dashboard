import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/roles/guards/roles.guard';
import { Roles } from 'src/roles/decorators/roles.decorator';
import { Role } from 'src/roles/enums/role.enum';
import { ParamsWithIdDto } from 'src/users/dtos/params-with-id.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Content')
@ApiBearerAuth()
@Controller()
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Delete('delete/content/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete content media' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'Content is successfully deleted.' })
  async deleteContent(@Param() { id }: ParamsWithIdDto): Promise<void> {
    return await this.contentService.delete(id);
  }
}
