export class CreateOrderDto {
  serviceId: string;
  clientId?: string;
  freelancerId?: string;
  quantity?: number = 1;
  requirements?: string;
  additionalOptions?: string[];
} 