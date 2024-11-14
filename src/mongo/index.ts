import { MongooseModule } from '@nestjs/mongoose';

import { TokenSchema } from './token';
import { UserSchema } from './user';
import { GlobalSchema } from './global';
import { PlanSchema } from './plan';

export const UserInst = MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]);
export const TokenInst = MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]);
export const GlobalInst = MongooseModule.forFeature([{ name: 'Global', schema: GlobalSchema }]);
export const PlanInst = MongooseModule.forFeature([{ name: 'Plan', schema: PlanSchema }]);
