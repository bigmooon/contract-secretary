import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ContractQueryDto,
  ContractResponseDto,
  CreateContractDto,
  ExpirationFilter,
  PaginatedContractsResponseDto,
  StakeholderResponseDto,
  UpdateContractDto,
} from './dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createContractDto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    const { propertyId, stakeholders, depositPrice, monthlyRent, ...rest } =
      createContractDto;

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('[Contracts] Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        '[Contracts] User does not have access to this property',
      );
    }

    const contract = await this.prisma.contract.create({
      data: {
        propertyId,
        depositPrice: BigInt(depositPrice),
        monthlyRent: monthlyRent ? BigInt(monthlyRent) : BigInt(0),
        contractDate: rest.contractDate ? new Date(rest.contractDate) : null,
        expirationDate: rest.expirationDate
          ? new Date(rest.expirationDate)
          : null,
        contractType: rest.contractType,
        memo: rest.memo,
        stakeholders: {
          create: stakeholders.map((s) => ({
            role: s.role,
            name: s.name,
            phone: s.phone,
          })),
        },
      },
      include: {
        property: {
          select: {
            id: true,
            complexName: true,
            buildingName: true,
            unitNo: true,
            typeInfo: true,
          },
        },
        stakeholders: true,
      },
    });

    return this.toContractResponse(contract);
  }

  async findAll(
    userId: string,
    query: ContractQueryDto,
  ): Promise<PaginatedContractsResponseDto> {
    const {
      page = 1,
      limit = 20,
      propertyId,
      contractType,
      status,
      expirationFilter,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ContractWhereInput = {
      property: { userId },
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (contractType) {
      where.contractType = contractType;
    }

    if (status) {
      where.status = status;
    }

    if (expirationFilter && expirationFilter !== ExpirationFilter.ALL) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (expirationFilter) {
        case ExpirationFilter.D7: {
          const d7 = new Date(today);
          d7.setDate(d7.getDate() + 7);
          where.expirationDate = { gte: today, lte: d7 };
          where.status = 'ACTIVE';
          break;
        }
        case ExpirationFilter.D30: {
          const d30 = new Date(today);
          d30.setDate(d30.getDate() + 30);
          where.expirationDate = { gte: today, lte: d30 };
          where.status = 'ACTIVE';
          break;
        }
        case ExpirationFilter.D90: {
          const d90 = new Date(today);
          d90.setDate(d90.getDate() + 90);
          where.expirationDate = { gte: today, lte: d90 };
          where.status = 'ACTIVE';
          break;
        }
        case ExpirationFilter.EXPIRED:
          where.expirationDate = { lt: today };
          break;
        case ExpirationFilter.UPCOMING: {
          const upcoming = new Date(today);
          upcoming.setDate(upcoming.getDate() + 90);
          where.expirationDate = { gte: today, lte: upcoming };
          where.status = 'ACTIVE';
          break;
        }
      }
    }

    if (search) {
      where.property = {
        ...(where.property as Prisma.PropertyWhereInput),
        OR: [
          { complexName: { contains: search, mode: 'insensitive' } },
          { buildingName: { contains: search, mode: 'insensitive' } },
          { unitNo: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, contracts] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ expirationDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          property: {
            select: {
              id: true,
              complexName: true,
              buildingName: true,
              unitNo: true,
              typeInfo: true,
            },
          },
          stakeholders: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: contracts.map((c) => this.toContractResponse(c)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(
    userId: string,
    contractId: string,
  ): Promise<ContractResponseDto> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        property: {
          select: {
            id: true,
            userId: true,
            complexName: true,
            buildingName: true,
            unitNo: true,
            typeInfo: true,
          },
        },
        stakeholders: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('[Contracts] Contract not found');
    }

    if (contract.property.userId !== userId) {
      throw new ForbiddenException(
        '[Contracts] User does not have access to this contract',
      );
    }

    return this.toContractResponse(contract);
  }

  async update(
    userId: string,
    contractId: string,
    updateContractDto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    await this.findOne(userId, contractId);

    const {
      stakeholders,
      depositPrice,
      monthlyRent,
      contractDate,
      expirationDate,
      ...rest
    } = updateContractDto;

    const updateData: Prisma.ContractUpdateInput = { ...rest };

    if (depositPrice !== undefined) {
      updateData.depositPrice = BigInt(depositPrice);
    }

    if (monthlyRent !== undefined) {
      updateData.monthlyRent = BigInt(monthlyRent);
    }

    if (contractDate !== undefined) {
      updateData.contractDate = contractDate ? new Date(contractDate) : null;
    }

    if (expirationDate !== undefined) {
      updateData.expirationDate = expirationDate
        ? new Date(expirationDate)
        : null;
    }

    if (stakeholders !== undefined) {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.stakeholder.deleteMany({
          where: { contractId },
        });

        return tx.contract.update({
          where: { id: contractId },
          data: {
            ...updateData,
            stakeholders: {
              create: stakeholders.map((s) => ({
                role: s.role,
                name: s.name,
                phone: s.phone,
              })),
            },
          },
          include: {
            property: {
              select: {
                id: true,
                complexName: true,
                buildingName: true,
                unitNo: true,
                typeInfo: true,
              },
            },
            stakeholders: true,
          },
        });
      });

      return this.toContractResponse(updated);
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            complexName: true,
            buildingName: true,
            unitNo: true,
            typeInfo: true,
          },
        },
        stakeholders: true,
      },
    });

    return this.toContractResponse(updated);
  }

  async remove(userId: string, contractId: string): Promise<void> {
    await this.findOne(userId, contractId);

    await this.prisma.contract.delete({
      where: { id: contractId },
    });
  }

  private calculateDDay(expirationDate: Date | null): {
    dDay: number | null;
    dDayBadge: string | null;
  } {
    if (!expirationDate) {
      return { dDay: null, dDayBadge: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dDayBadge: string | null = null;
    if (dDay < 0) {
      dDayBadge = 'EXPIRED';
    } else if (dDay <= 7) {
      dDayBadge = 'D-7';
    } else if (dDay <= 30) {
      dDayBadge = 'D-30';
    } else if (dDay <= 90) {
      dDayBadge = 'D-90';
    }

    return { dDay, dDayBadge };
  }

  private toContractResponse(contract: any): ContractResponseDto {
    const { dDay, dDayBadge } = this.calculateDDay(contract.expirationDate);

    return {
      id: contract.id,
      propertyId: contract.propertyId,
      contractType: contract.contractType,
      depositPrice: contract.depositPrice.toString(),
      monthlyRent: contract.monthlyRent.toString(),
      contractDate: contract.contractDate
        ? contract.contractDate.toISOString().split('T')[0]
        : null,
      expirationDate: contract.expirationDate
        ? contract.expirationDate.toISOString().split('T')[0]
        : null,
      status: contract.status,
      memo: contract.memo,
      dDay,
      dDayBadge,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      property: contract.property
        ? {
            id: contract.property.id,
            complexName: contract.property.complexName,
            buildingName: contract.property.buildingName,
            unitNo: contract.property.unitNo,
            typeInfo: contract.property.typeInfo,
          }
        : undefined,
      stakeholders:
        contract.stakeholders?.map(
          (s: any): StakeholderResponseDto => ({
            id: s.id,
            role: s.role,
            name: s.name,
            phone: s.phone,
          }),
        ) ?? [],
    };
  }
}
