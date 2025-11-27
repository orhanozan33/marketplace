import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Order } from '../../entities/order.entity';
import { AdminWallet } from '../../entities/admin-wallet.entity';
import { User } from '../../entities/user.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, AdminWallet, User]),
    OrdersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

