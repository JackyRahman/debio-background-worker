import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalysisOrderPaidCommand } from './genetic-analysis-order-paid.command';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalysisOrderPaidCommand)
export class GeneticAnalysisOrderPaidHandler
  implements ICommandHandler<GeneticAnalysisOrderPaidCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderPaidCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalysisOrderPaidCommand) {
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    await this.logger.log(
      `Genetic Analysis Order Paid With GA Order ID: ${geneticAnalysisOrder.id}!`,
    );

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          14,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        const geneticAnalysisOrderLogging: TransactionLoggingDto = {
          address: geneticAnalysisOrder.customerId,
          amount: +geneticAnalysisOrder.prices[0].value,
          created_at: geneticAnalysisOrder.updatedAt,
          currency: geneticAnalysisOrder.currency.toUpperCase(),
          parent_id: BigInt(geneticAnalysisOrderHistory.id ?? 0),
          ref_number: geneticAnalysisOrder.id,
          transaction_status: 14,
          transaction_type: 3,
        };

        await this.loggingService.create(geneticAnalysisOrderLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationNewOrderGeneticAnalyst: NotificationDto = {
        role: 'GA',
        entity_type: 'Genetic Analyst',
        entity: 'New Order',
        description: `A new order ${geneticAnalysisOrder.geneticAnalysisTrackingId} is awaiting process.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysisOrder.sellerId,
        block_number: blockNumber,
      };

      this.notificationService.insert(notificationNewOrderGeneticAnalyst);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
