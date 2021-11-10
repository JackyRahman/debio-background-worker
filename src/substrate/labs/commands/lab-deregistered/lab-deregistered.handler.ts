import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabDeregisteredCommand } from './lab-deregistered.command';

@Injectable()
@CommandHandler(LabDeregisteredCommand)
export class LabDeregisteredHandler
  implements ICommandHandler<LabDeregisteredCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabDeregisteredCommand) {
    const { labs: lab } = command;
    await this.elasticsearchService.delete({
      index: 'labs',
      id: lab.accountId,
      refresh: 'wait_for',
    });

    await this.elasticsearchService.deleteByQuery({
      index: 'services',
      refresh: true,
      body: {
        query: {
          match: {
            owner_id: lab.accountId,
          },
        },
      },
    });
  }
}
