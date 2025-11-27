import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { AdminWallet } from '../../entities/admin-wallet.entity';
import { User } from '../../entities/user.entity';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(AdminWallet)
    private adminWalletRepository: Repository<AdminWallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private ordersService: OrdersService,
  ) {}

  async getDisputedOrders() {
    return this.orderRepository.find({
      where: { status: 'disputed' as any },
      relations: ['buyer', 'seller', 'listing'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminWallet() {
    let adminWallet = await this.adminWalletRepository.findOne({ where: {} });

    if (!adminWallet) {
      adminWallet = this.adminWalletRepository.create({
        totalCommission: 0,
        totalChipsSold: 0,
      });
      adminWallet = await this.adminWalletRepository.save(adminWallet);
    }

    return adminWallet;
  }

  async resolveDispute(orderId: string, adminId: string, resolution: 'complete' | 'cancel') {
    return this.ordersService.resolveDispute(orderId, adminId, resolution);
  }

  async getAllUsers() {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'email', 'trustScore', 'isVerified', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  async getAllOrders() {
    const orders = await this.orderRepository.find({
      relations: ['buyer', 'seller', 'listing'],
      order: { createdAt: 'DESC' },
    });
    return orders;
  }
}

