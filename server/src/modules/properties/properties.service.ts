import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ContractSummaryDto,
  CreatePropertyDto,
  PaginatedPropertiesResponseDto,
  PropertyQueryDto,
  PropertyResponseDto,
  UpdatePropertyDto,
} from './dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createPropertyDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    const property = await this.prisma.property.create({
      data: {
        userId,
        ...createPropertyDto,
      },
    });

    return this.toPropertyResponse(property);
  }

  async findAll(
    userId: string,
    query: PropertyQueryDto,
  ): Promise<PaginatedPropertiesResponseDto> {
    const {
      page = 1,
      limit = 20,
      search,
      complexName,
      includeContracts,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = { userId };

    if (complexName) {
      where.complexName = complexName;
    }

    if (search) {
      where.OR = [
        { complexName: { contains: search, mode: 'insensitive' } },
        { buildingName: { contains: search, mode: 'insensitive' } },
        { unitNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, properties] = await Promise.all([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: includeContracts
          ? {
              contracts: {
                select: {
                  id: true,
                  contractType: true,
                  status: true,
                  expirationDate: true,
                },
                orderBy: { createdAt: 'desc' },
              },
            }
          : undefined,
      }),
    ]);

    // calc total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: properties.map((p) => this.toPropertyResponse(p, includeContracts)),
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
    propertyId: string,
    includeContracts: boolean = true,
  ): Promise<PropertyResponseDto> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: includeContracts
        ? {
            contracts: {
              select: {
                id: true,
                contractType: true,
                status: true,
                expirationDate: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          }
        : undefined,
    });

    if (!property) {
      throw new NotFoundException('[Properties] Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        '[Properties] User does not have access to this property',
      );
    }

    return this.toPropertyResponse(property, includeContracts);
  }

  async update(
    userId: string,
    propertyId: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    await this.findOne(userId, propertyId, false);

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: updatePropertyDto,
    });

    return this.toPropertyResponse(updated);
  }

  async remove(userId: string, propertyId: string): Promise<void> {
    await this.findOne(userId, propertyId, false);

    await this.prisma.property.delete({
      where: { id: propertyId },
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

  private toPropertyResponse(
    property: any,
    includeContracts: boolean = false,
  ): PropertyResponseDto {
    const response: PropertyResponseDto = {
      id: property.id,
      complexName: property.complexName,
      buildingName: property.buildingName,
      unitNo: property.unitNo,
      typeInfo: property.typeInfo,
      note: property.note,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };

    if (includeContracts && property.contracts) {
      response.contracts = property.contracts.map(
        (c: any): ContractSummaryDto => {
          const { dDay, dDayBadge } = this.calculateDDay(c.expirationDate);
          return {
            id: c.id,
            contractType: c.contractType,
            status: c.status,
            // convert to YYYY-MM-DD
            expirationDate: c.expirationDate
              ? c.expirationDate.toISOString().split('T')[0]
              : null,
            dDay,
            dDayBadge,
          };
        },
      );
    }

    return response;
  }
}
