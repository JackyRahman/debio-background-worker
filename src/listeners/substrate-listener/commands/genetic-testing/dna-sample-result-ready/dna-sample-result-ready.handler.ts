import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DnaSampleResultReadyCommand } from './dna-sample-result-ready.command';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';
import { DateTimeProxy, NotificationService } from '../../../../../common';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(DnaSampleResultReadyCommand)
export class DnaSampleResultReadyCommandHandler
  implements ICommandHandler<DnaSampleResultReadyCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: DnaSampleResultReadyCommand) {
    const dnaSample = command.dnaSample;

    const currDateTime = this.dateTimeProxy.new();

    const testResultNotification: NotificationDto = {
      role: 'Customer',
      entity_type: 'Genetic Testing Tracking',
      entity: 'Order Fulfilled',
      description: `Your test results for ${dnaSample.orderId} are out. Click here to see your order details.`,
      read: false,
      created_at: currDateTime,
      updated_at: currDateTime,
      deleted_at: null,
      from: 'Debio Network',
      to: dnaSample.ownerId,
      block_number: "",
    };

    await this.notificationService.insert(testResultNotification);
  }
}
