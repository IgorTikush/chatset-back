import { Exclude, Expose, Transform } from 'class-transformer';

import { Limit } from '../../limit/models/limit.model';

@Exclude()
export class UserResponseDTO {
  @Expose()
  @Transform(({ value }) => value.toString())
  _id: string;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose()
  limits?: Limit;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}
