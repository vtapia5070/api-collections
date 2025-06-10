import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsUrl } from 'class-validator';

export class CreateCatDto {
  @ApiProperty({ description: 'Name of the cat' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Age of the cat in years',
    required: false,
    minimum: 0,
    maximum: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  age?: number;

  @ApiProperty({ description: 'Breed of the cat' })
  @IsString()
  breed: string;

  @ApiProperty({ description: "URL to the cat's image", required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
