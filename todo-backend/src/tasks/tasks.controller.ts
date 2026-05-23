import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Req() req:any, @Body() CreateTaskDto:any){
    return this.tasksService.create(req.user.id, CreateTaskDto)
  }

  @Get()
  findAll(@Req() req:any, @Query('view') view:'my' | 'subordinates' = 'my') {
    return this.tasksService.findAll(req.user.id, view)
  }

  @Patch(':id')
  update(@Req() req:any, @Param('id') id:string, @Body() UpdateTaskDto:any) {
    return this.tasksService.update(req.user.id, +id, UpdateTaskDto)
  }
}
