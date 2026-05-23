import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma:PrismaService) {}

  async create(data: CreateUserDto) {
    const candidate = await this.prisma.user.findUnique({
      where: {
        login:data.login
      }
    })

    if(candidate) {
      throw new BadRequestException('Пользователь с таким логином уже существует')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data: {...data, password:hashedPassword },
      select: {id:true, login:true, firstName:true, lastName:true, managerId:true }
    })
  }

  async findByLogin(login:string) {
    return await this.prisma.user.findUnique({
      where: {login}
    }) 
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {id},
      select: {id:true, login:true, firstName:true, lastName:true, managerId:true,}
    })
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {id:true, login:true, firstName:true, lastName:true, managerId:true}
    });
  }
}
