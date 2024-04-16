import { Either, failure, success } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { UseCase } from '@/core/use-cases/use-case'
import { Workstation } from '@/domain/it-manager/enterprise/entities/workstation'
import { ComputersRepository } from '../../repositories/computers-repository'
import { DepartmentsRepository } from '../../repositories/departments-repositories'
import { WorkstationsRepository } from '../../repositories/workstations-repository'

interface RegisterWorkstationUseCaseProps {
  tag: string
  departmentId: string
  computerId: string
}

type RegisterWorkstationUseCaseResponse = Either<ResourceNotFoundError, { workstation: Workstation }>

export class RegisterWorkstationUseCase implements UseCase {
  constructor(
    private workstationsRepository: WorkstationsRepository,
    private departmentsRepository: DepartmentsRepository,
    private computersRepository: ComputersRepository,
  ) {}

  async execute({
    tag,
    departmentId,
    computerId,
  }: RegisterWorkstationUseCaseProps): Promise<RegisterWorkstationUseCaseResponse> {
    const department = await this.departmentsRepository.findById(departmentId)

    if (!department) {
      return failure(new ResourceNotFoundError(`Department with id ${departmentId} not found`))
    }

    const computer = await this.computersRepository.findById(computerId)

    if (!computer) {
      return failure(new ResourceNotFoundError(`Computer with id ${computerId} not found`))
    }

    const workstation = Workstation.create({
      tag,
      departmentId: new UniqueEntityID(departmentId),
      computerId: new UniqueEntityID(computerId),
    })

    await this.workstationsRepository.create(workstation)

    return success({
      workstation,
    })
  }
}