import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { Payment } from '../../billing/models/payment.model';

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
  // @Type(() => Payment)
  lastPayment?: Payment;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}
