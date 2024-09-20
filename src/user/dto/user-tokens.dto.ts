import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class UserTokensDTO {
  @Expose()
  @IsString()
  readonly _id: string;

  @Expose()
  @IsString()
  readonly token: string;

  @Expose()
  @IsString()
  readonly access_token: string;

  @Expose()
  @IsString()
  readonly refresh_token: string;

  constructor(partial: Partial<UserTokensDTO>) {
    Object.assign(this, partial);
  }
}
