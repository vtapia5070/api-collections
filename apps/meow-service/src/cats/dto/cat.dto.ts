import { ApiProperty } from '@nestjs/swagger';

export class CatDto {
  @ApiProperty({ description: 'Unique identifier of the cat' })
  id: string;

  @ApiProperty({ description: 'Name of the cat' })
  name: string;

  @ApiProperty({
    description: 'Age of the cat in years',
    required: false,
    minimum: 0,
    maximum: 30,
  })
  age?: number;

  @ApiProperty({ description: 'Breed of the cat' })
  breed: string;

  @ApiProperty({
    description: "URL to the cat's image",
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({ description: 'When the record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the record was last updated' })
  updatedAt: Date;
}
