import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserValidation {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 256)
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 256)
  readonly passwordConfirm: string;
}
