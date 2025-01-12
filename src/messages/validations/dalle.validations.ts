import {
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class DalleValidation {
  @IsString()
  @IsIn(['DALL-E 3'])
  model: string;

  @IsString()
  prompt: string;

  @IsString()
  @IsIn(['b64_json'])
  response_format: string;

  @IsNumber()
  @IsOptional()
  n?: number = 1;

  @IsString()
  @IsIn(['1024x1024', '1792x1024', '1024x1792'])
  size: string;

  @IsString()
  @IsIn(['standard', 'hd'])
  quality: string;

  @IsString()
  @IsIn(['vivid', 'natural'])
  style: string;
}
