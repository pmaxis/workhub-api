import { Module } from '@nestjs/common';
import { AbilityModule } from '@/common/ability/ability.module';
import { workspaceAbilityDefinitions } from '@/modules/workspace/ability/workspace.ability';

@Module({
  imports: [AbilityModule.forModule(workspaceAbilityDefinitions)],
})
export class WorkspaceModule {}
