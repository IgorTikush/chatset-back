import {
  IsString,
  IsIn,
  IsOptional,
} from 'class-validator';

export class SDModelValidation {
  @IsString()
  @IsIn(['ultra', 'core', 'sd3'])
  model: string;
}

export class SDGenerationValidation {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  negative_prompt?: string;

  @IsString()
  @IsIn(['1:1', '16:9', '21:9', '4:3', '2:3', '3:4', '4:5', '5:4', '9:16', '9:21'])
  aspect_ratio: string;

  @IsString()
  seed: string;

  @IsString()
  @IsIn(['png', 'jpg', 'jpeg'])
  output_format: string;

  @IsIn(['sd3-medium', 'sd3-large', 'sd3-large-turbo'])
  @IsOptional()
  model?: string;
}
