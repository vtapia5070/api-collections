import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatDto } from './dto/cat.dto';
import { FindAllCatsDto } from './dto/find-all-cats.dto';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindAllCatsDto): Promise<{
    data: CatDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      breed,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      ...(breed && { breed }),
    };

    // Get total count for pagination
    const total = await this.prisma.cat.count({ where });

    // Get paginated and sorted data
    const data = await this.prisma.cat.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async create(createCatDto: CreateCatDto): Promise<CatDto> {
    const cat = await this.prisma.cat.create({ data: createCatDto });
    return cat;
  }
}
