import { IsString, IsIn } from 'class-validator';

import { allModels } from '../../constants';

export class CreateChatValidation {
  @IsString()
  @IsIn(allModels)
  model: string;
}
