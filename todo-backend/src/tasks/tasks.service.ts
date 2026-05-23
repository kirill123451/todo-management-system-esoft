import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(creatorId:number, dto:any) {
    const responsibleId = Number(dto.responsibleId)

    if(responsibleId !== creatorId) {
      const responsibleUser = await this.prisma.user.findUnique({
        where:{
          id:responsibleId
        }

      })
      if(!responsibleUser || responsibleUser.managerId !== creatorId) {
        throw new BadRequestException('Вы можете назначить задачи только себе или своим подчиненным')
      }
    }

    return this.prisma.task.create({
      data:{
        title:dto.title,
        description:dto.description,
        dueDate: new Date(dto.dueDate),
        priority: dto.priority,
        status:dto.status || 'TODO',
        creatorId: creatorId,
        responsibleId: responsibleId
      }
    })
  }
  
  async findAll(userId:number, view: 'my' | 'subordinates') {
    let whereCondition = {}

    if(view === 'subordinates') {
      whereCondition = {
        creatorId: userId,
        NOT: {responsibleId:userId}
      }
    }else {
      whereCondition = {responsibleId:userId}
    }

    const tasks = await this.prisma.task.findMany({
      where:whereCondition,
      include: {
        creator: {select: {firstName:true, lastName:true}},
        responsible: {select:{firstName:true, lastName:true}}
      },
      orderBy: {
        updatedAt:'desc'
      }
    })
    return tasks

  }

  async update(userId:number, taskId:number, dto:any) {
    const task = await this.prisma.task.findUnique({where: {id:taskId}})
    if (!task) {
      throw new NotFoundException('Задача не найдена')
    }

    const user = await this.prisma.user.findUnique({where: {id:userId}})
    const isCreatedByManager = task.creatorId === user?.managerId

    if(isCreatedByManager) {
      const allowedKeys = ['status']
      const incomingKeys = Object.keys(dto).filter(key => dto[key] !== undefined)
      const hasDisallowedFields = incomingKeys.some(key => !allowedKeys.includes(key))
      if(hasDisallowedFields) {
        throw new ForbiddenException('Вы можете изменять только статус у задач, созданные руководителем')
      }}
    else if (task.creatorId !== userId && task.responsibleId !== userId) {
      throw new ForbiddenException('У вас нет прав на редактирование этой задачи')
      }

    const updateData:any = {}
    if(dto.title) updateData.title = dto.title
    if(dto.description) updateData.description = dto.description
    if(dto.priority) updateData.priority = dto.priority
    if(dto.status) updateData.status = dto.status
    if(dto.dueDate) updateData.dueDate = new Date(dto.dueDate)
    if(dto.responsibleId) {
      const respId = Number(dto.responsibleId)
      if(respId !== userId && task.creatorId === userId){
        const responsibleUser = await this.prisma.user.findUnique({where: {id:respId}})
        if(!responsibleUser || responsibleUser.managerId !== userId) {
          throw new BadRequestException('Назначить можно только своего подчиненного')
        }
      }
      updateData.responsibleId = respId 
    }

    return this.prisma.task.update({
      where: {id:taskId},
      data:updateData
    })
  }
}
