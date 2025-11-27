import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from '../../entities/payment.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { ConfigService } from '@nestjs/config';
import * as Iyzipay from 'iyzipay';

@Injectable()
export class PaymentsService {
  private iyzipay: any;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    // İyzico yapılandırması
    const iyzicoApiKey = this.configService.get('IYZICO_API_KEY');
    const iyzicoSecretKey = this.configService.get('IYZICO_SECRET_KEY');
    const iyzicoBaseUrl = this.configService.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com';

    if (iyzicoApiKey && iyzicoSecretKey) {
      this.iyzipay = new Iyzipay({
        apiKey: iyzicoApiKey,
        secretKey: iyzicoSecretKey,
        uri: iyzicoBaseUrl,
      });
    }
  }

  async createCardPayment(
    userId: string,
    orderId: string,
    cardData: {
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
      cardHolderName: string;
    },
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId) {
      throw new BadRequestException('You can only pay for your own orders');
    }

    if (order.status !== OrderStatus.PAYMENT_PENDING) {
      throw new BadRequestException('Order is not in payment pending status');
    }

    // İyzico ile ödeme
    if (!this.iyzipay) {
      throw new InternalServerErrorException('Payment gateway not configured');
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: orderId,
      price: order.price.toString(),
      paidPrice: order.price.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: orderId,
      paymentCard: {
        cardNumber: cardData.cardNumber,
        expireMonth: cardData.expireMonth,
        expireYear: cardData.expireYear,
        cvc: cardData.cvc,
        registerCard: '0',
        cardHolderName: cardData.cardHolderName,
      },
      buyer: {
        id: userId,
        name: 'Buyer',
        surname: 'User',
        gsmNumber: '+905350000000',
        email: 'buyer@example.com',
        identityNumber: '11111111111',
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: 'Address',
        ip: '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000',
      },
      shippingAddress: {
        contactName: 'Buyer',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Address',
        zipCode: '34000',
      },
      billingAddress: {
        contactName: 'Buyer',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Address',
        zipCode: '34000',
      },
      basketItems: [
        {
          id: orderId,
          name: `${order.amount} Çip`,
          category1: 'Gaming',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: order.price.toString(),
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.iyzipay.payment.create(request, async (err: any, result: any) => {
        if (err) {
          // Ödeme kaydı oluştur (failed)
          const payment = this.paymentRepository.create({
            userId,
            orderId,
            amount: order.price,
            currency: 'TRY',
            paymentMethod: PaymentMethod.CREDIT_CARD,
            status: PaymentStatus.FAILED,
            paymentGateway: 'iyzico',
            gatewayResponse: JSON.stringify(err),
          });
          await this.paymentRepository.save(payment);

          reject(new BadRequestException(err.errorMessage || 'Payment failed'));
          return;
        }

        // Ödeme başarılı
        if (result.status === 'success') {
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            // Payment kaydı oluştur
            const payment = queryRunner.manager.create(Payment, {
              userId,
              orderId,
              amount: order.price,
              currency: 'TRY',
              paymentMethod: PaymentMethod.CREDIT_CARD,
              status: PaymentStatus.COMPLETED,
              paymentGateway: 'iyzico',
              transactionId: result.paymentId,
              gatewayResponse: JSON.stringify(result),
              completedAt: new Date(),
            });
            await queryRunner.manager.save(payment);

            // Order durumunu güncelle
            order.status = OrderStatus.PAYMENT_CONFIRMED;
            order.paymentConfirmedAt = new Date();
            order.paymentReceiptUrl = result.paymentId;
            await queryRunner.manager.save(order);

            await queryRunner.commitTransaction();

            resolve({
              success: true,
              paymentId: payment.id,
              transactionId: result.paymentId,
              message: 'Payment completed successfully',
            });
          } catch (error) {
            await queryRunner.rollbackTransaction();
            reject(new InternalServerErrorException('Payment processing failed'));
          } finally {
            await queryRunner.release();
          }
        } else {
          // Ödeme başarısız
          const payment = this.paymentRepository.create({
            userId,
            orderId,
            amount: order.price,
            currency: 'TRY',
            paymentMethod: PaymentMethod.CREDIT_CARD,
            status: PaymentStatus.FAILED,
            paymentGateway: 'iyzico',
            gatewayResponse: JSON.stringify(result),
          });
          await this.paymentRepository.save(payment);

          reject(new BadRequestException(result.errorMessage || 'Payment failed'));
        }
      });
    });
  }

  async createBankTransferPayment(
    userId: string,
    orderId: string,
    transferData: {
      iban: string;
      bankName: string;
      accountHolder: string;
      receiptUrl?: string;
      notes?: string;
    },
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId) {
      throw new BadRequestException('You can only pay for your own orders');
    }

    if (order.status !== OrderStatus.PAYMENT_PENDING) {
      throw new BadRequestException('Order is not in payment pending status');
    }

    // IBAN/Havale ödeme kaydı oluştur (manuel onay bekliyor)
    const payment = this.paymentRepository.create({
      userId,
      orderId,
      amount: order.price,
      currency: 'TRY',
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PENDING,
      paymentGateway: 'manual',
      iban: transferData.iban,
      bankName: transferData.bankName,
      accountHolder: transferData.accountHolder,
      receiptUrl: transferData.receiptUrl,
      notes: transferData.notes,
    });

    await this.paymentRepository.save(payment);

    return {
      success: true,
      paymentId: payment.id,
      message: 'Bank transfer payment created. Waiting for admin approval.',
      payment,
    };
  }

  async approveBankTransfer(paymentId: string, adminId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not pending');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Payment durumunu güncelle
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      await queryRunner.manager.save(payment);

      // Order durumunu güncelle
      if (payment.order) {
        payment.order.status = OrderStatus.PAYMENT_CONFIRMED;
        payment.order.paymentConfirmedAt = new Date();
        payment.order.paymentReceiptUrl = payment.receiptUrl;
        await queryRunner.manager.save(payment.order);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Bank transfer payment approved',
        payment,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Payment approval failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserPayments(userId: string) {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingBankTransfers() {
    return this.paymentRepository.find({
      where: {
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
      },
      relations: ['user', 'order'],
      order: { createdAt: 'DESC' },
    });
  }
}

