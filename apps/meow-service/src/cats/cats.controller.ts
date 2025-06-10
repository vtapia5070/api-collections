import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  getSchemaPath,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CatsService } from './cats.service';
import { CatDto } from './dto/cat.dto';
import { FindAllCatsDto } from './dto/find-all-cats.dto';
import { CreateCatDto } from './dto/create-cat.dto';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cats' })
  @ApiOkResponse({
    description: 'Returns a paginated list of cats',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(CatDto) },
        },
        total: {
          type: 'number',
          description: 'Total number of cats',
        },
        page: {
          type: 'number',
          description: 'Current page number',
        },
        limit: {
          type: 'number',
          description: 'Number of items per page',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async findAll(
    @Query() query: FindAllCatsDto,
  ): Promise<{ data: CatDto[]; total: number; page: number; limit: number }> {
    return this.catsService.findAll(query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Cat created', type: CatDto })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() createCatDto: CreateCatDto): Promise<CatDto> {
    return this.catsService.create(createCatDto);
  }
}
