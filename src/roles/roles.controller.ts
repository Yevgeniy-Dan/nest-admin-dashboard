import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { Role } from './schemas/role.schema';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { ParamsWithIdDto } from 'src/users/dtos/params-with-id.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post('create/role')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto, description: 'Role data to create' })
  @ApiCreatedResponse({
    description: 'Role created successfully',
    type: Role,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async createRole(@Body() role: CreateRoleDto): Promise<Role> {
    return await this.rolesService.create(role);
  }

  @Patch('update/role/:id')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update role' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto, description: 'Role data to update' })
  @ApiOkResponse({
    description: 'Role data updated successfully',
    type: Role,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateRole(
    @Param() { id }: ParamsWithIdDto,
    @Body() role: UpdateRoleDto,
  ): Promise<Role> {
    return await this.rolesService.update(id, role);
  }

  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('delete/role/:id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({ description: 'Role is successfully deleted.' })
  async deleteRole(@Param() { id }: ParamsWithIdDto): Promise<void> {
    //TODO: Should I delete roles from user schema recursively?
    await this.rolesService.delete(id);
  }

  @Get('role')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get a role by ID',
    description: 'Retrieve a role by its ID.',
  })
  @ApiBody({ type: ParamsWithIdDto, description: 'Role ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved role.',
    type: Role,
  })
  @ApiNotFoundResponse({ description: 'Role not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getRole(@Body() { name }: { name: string }): Promise<Role> {
    return this.rolesService.findOne(name);
  }

  @Get('roles')
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all roles',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Roles successfully retrieved.',
    type: [Role],
  })
  @ApiNotFoundResponse({ description: 'Roles not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAllRoles(): Promise<Role[]> {
    return await this.rolesService.findAll();
  }
}
