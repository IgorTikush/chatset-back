import { IsEmail, IsString } from 'class-validator';

export class LoginUserValidation {
  @IsEmail()
  readonly username: string;

  @IsString()
  readonly password: string;
}
