import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { ExpensesService } from '@/modules/expenses/service/expenses.service';
import { CreateExpenseDto } from '@/modules/expenses/dto/create-expense.dto';
import { UpdateExpenseDto } from '@/modules/expenses/dto/update-expense.dto';
import { QueryExpensesDto } from '@/modules/expenses/dto/query-expenses.dto';
import { ExpenseResponseDto } from '@/modules/expenses/dto/expense-response.dto';
import { PaginatedExpensesResponseDto } from '@/modules/expenses/dto/paginated-expenses-response.dto';

@ApiTags('Expenses')
@ApiBearerAuth('access-token')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  @ApiCreatedResponse({ type: ExpenseResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Expense'))
  create(
    @Body() dto: CreateExpenseDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses (paginated, CASL-scoped)' })
  @ApiOkResponse({ type: PaginatedExpensesResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Expense'))
  findAll(
    @Query() query: QueryExpensesDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<PaginatedExpensesResponseDto> {
    return this.expensesService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Expense'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Expense'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete expense' })
  @ApiParam({ name: 'id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Expense'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.expensesService.delete(id, ability);
  }
}
