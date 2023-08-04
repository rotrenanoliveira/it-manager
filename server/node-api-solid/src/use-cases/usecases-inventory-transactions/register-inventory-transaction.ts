import { InventoryTransactionsRepository } from '@/repositories/inventory-transactions-repository'
import { InventoryRepository } from '@/repositories/inventory-repository'
import { ResourceNotFound } from '../errors/resource-not-found'
import { InvalidTransactionQuantityError } from '../errors/invalid-transaction-quantity'

export class RegisterInventoryTransactionUseCase {
  constructor(
    private inventoryRepository: InventoryRepository,
    private inventoryTransactionsRepository: InventoryTransactionsRepository,
  ) {}

  async execute({ itemId, operator, quantity, transaction_type }: InventoryTransactionCreateInput): Promise<void> {
    const item = await this.inventoryRepository.findById(itemId)

    if (!item) {
      throw new ResourceNotFound('item')
    }

    if (quantity > item.quantity) {
      throw new InvalidTransactionQuantityError()
    }

    await this.inventoryTransactionsRepository.create({
      itemId,
      operator,
      quantity,
      transaction_type,
    })

    if (transaction_type === 'INSERT') {
      await this.inventoryRepository.insert({
        itemId,
        quantity,
      })
    } else {
      await this.inventoryRepository.consume({
        itemId,
        quantity,
      })
    }

    return
  }
}