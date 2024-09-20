import { MongooseModule } from '@nestjs/mongoose';

import { TokenSchema } from './token';
import { UserSchema } from './user';

export const UserInst = MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]);
export const TokenInst = MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]);
