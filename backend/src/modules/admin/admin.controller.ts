import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('disputes')
  async getDisputedOrders() {
    return this.adminService.getDisputedOrders();
  }

  @Get('wallet')
  async getAdminWallet() {
    return this.adminService.getAdminWallet();
  }

  @Post('disputes/:orderId/resolve')
  async resolveDispute(
    @Param('orderId') orderId: string,
    @Body() body: { resolution: 'complete' | 'cancel' },
    @CurrentUser() user: any,
  ) {
    return this.adminService.resolveDispute(orderId, user.userId, body.resolution);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }
}

