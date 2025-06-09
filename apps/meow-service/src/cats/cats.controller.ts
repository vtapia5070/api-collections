import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CatsService } from './cats.service';
import { CatDto } from './dto/cat.dto';
import { FindAllCatsDto } from './dto/find-all-cats.dto';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cats' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of cats',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CatDto' },
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
  findAll(@Query() query: FindAllCatsDto) {
    return this.catsService.findAll(query);
  }
}
