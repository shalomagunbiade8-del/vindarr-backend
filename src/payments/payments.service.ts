import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';  // ADD
import axios from 'axios';
import { SessionsService } from '../sessions/sessions.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private PAYSTACK_SECRET: string;

  constructor(
  private sessionsService: SessionsService,
  private ordersService: OrdersService,
  private configService: ConfigService,
)
  
  {
    this.PAYSTACK_SECRET = this.configService.get<string>('PAYSTACK_SECRET_KEY')!; // FIX 4
    console.log("PAYSTACK KEY LOADED:", this.PAYSTACK_SECRET); // TEMP DEBUG
  }

  // Initialize payment with session metadata
  async initialize(email: string, amount: number, sessionId: number) {
  if (!email) {
    throw new Error("Email is required for payment");
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize', // FIX 1: correct URL
      {
        email: email,          // FIX 2: proper object format
        amount: amount * 100,  // amount in kobo
        metadata: { sessionId } 
      },
      {
        headers: {             // FIX 3: proper headers
          Authorization: `Bearer ${this.PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // VERY IMPORTANT
      }
    );

    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("Paystack response error:", error.response.data);
    } else if (error.request) {
      console.error("Paystack no response:", error.request);
    } else {
      console.error("Paystack setup error:", error.message);
    }

    throw new Error('Payment initialization failed');
  }
} 

  // Verify payment and mark session as paid
  async verify(reference: string, sessionId: number) {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.PAYSTACK_SECRET}`,
        },
      }
    );

    const data = response.data;

    if (data.data.status !== 'success') {
      throw new Error('Payment not successful');
    }

    // ✅ GET session to validate amount
    const session = await this.sessionsService.findById(sessionId);

    if (data.data.amount !== session.price * 100) {
      throw new Error('Payment amount mismatch');
    }

    await this.sessionsService.markSessionAsPaid(sessionId);

    return data;

  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error);
    throw new Error('Payment verification failed');
  }
} 

async initializeOrderPayment(
  email: string,
  amount: number,
  orderId: number
) {

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: amount * 100,
      metadata: {
        orderId
      }
    },
    {
      headers: {
        Authorization: `Bearer ${this.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

async verifyOrderPayment(
  reference: string,
  orderId: number
) {

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${this.PAYSTACK_SECRET}`,
      },
    }
  );

  const data = response.data;

  if(data.data.status !== 'success'){
    throw new Error('Payment failed');
  }

  const order = await this.ordersService.findById(orderId);

  if(data.data.amount !== order.amount * 100){
    throw new Error('Amount mismatch');
  }

  await this.ordersService.markOrderAsPaid(
    orderId,
    reference
  );

  return data;
}

}