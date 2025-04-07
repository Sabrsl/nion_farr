import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../schemas/user.schema';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('profile')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  updateProfile(@Request() req, @Body() updateUserDto: any) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('change-password')
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  changePassword(@Request() req, @Body() changePasswordDto: any) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('freelancers')
  @Public()
  findFreelancers() {
    return this.usersService.findFreelancers();
  }
} 