import { InventoryTransactionsRepository } from '@/repositories/inventory-transactions-repository'
import { InventoryRepository } from '@/repositories/inventory-repository'
import { ResourceNotFound } from './errors/resource-not-found'

export class RegisterInventoryTransactionUseCase {
  constructor(
    private inventoryRepository: InventoryRepository,
    private inventoryTransactionsRepository: InventoryTransactionsRepository,
  ) {}

  async execute({ item_id, operator, quantity, transaction_type }: InventoryTransactionCreateInput): Promise<void> {
    const item = await this.inventoryRepository.findById(item_id)

    if (!item) {
      throw new ResourceNotFound('item')
    }

    if (quantity > item.quantity) {
      throw new Error('The quantity to be consumed must not be greater than the quantity available.')
    }

    await this.inventoryTransactionsRepository.create({
      item_id,
      operator,
      quantity,
      transaction_type,
    })

    if (transaction_type === 'INSERT') {
      await this.inventoryRepository.insert({
        item_id,
        quantity,
      })
    } else {
      await this.inventoryRepository.consume({
        item_id,
        quantity,
      })
    }

    return
  }
}