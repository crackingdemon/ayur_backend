import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class AppointmentService {
  async bookAppointment(organizationId: string, data: {
    isNewPatient: boolean;
    patientId?: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    date: string;
    time: string;
    duration: number;
    reason: string;
    source: string;
  }) {
    let patientId = data.patientId;

    if (data.isNewPatient) {
      const patient = await prisma.patient.create({
        data: {
          organizationId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
        },
      });
      patientId = patient.id;
    } else if (!patientId) {
      throw new Error("Patient ID is required for existing patients.");
    }

    // Combine date and time to create a valid DateTime for Visit
    const dateTime = new Date(`${data.date}T${data.time}:00Z`);

    const visit = await prisma.visit.create({
      data: {
        organizationId,
        patientId: patientId as string,
        date: dateTime,
        doctor: 'Dr. Default', // In a real app, you'd get this from the auth token or request
        reason: data.reason,
        type: data.source,
        duration: data.duration,
        status: 'Scheduled',
      },
    });

    return visit;
  }

  async getAppointmentsToday(organizationId: string, dateString?: string) {
    let today: Date;
    let tomorrow: Date;

    if (dateString) {
      today = new Date(`${dateString}T00:00:00Z`);
      tomorrow = new Date(`${dateString}T00:00:00Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    } else {
      today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    }

    return await prisma.visit.findMany({
      where: {
        organizationId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getAppointmentsPaginated(organizationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.visit.findMany({
        where: { organizationId },
        skip,
        take: limit,
        include: {
          patient: true,
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.visit.count({ where: { organizationId } })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateStatus(organizationId: string, id: string, status: string) {
    const data: any = { status };
    if (status === 'Waiting') {
      data.checkInTime = new Date();
    } else if (status === 'Completed' || status === 'Cancelled') {
      data.checkoutTime = new Date();
    }
    
    return await prisma.visit.updateMany({
      where: { id, organizationId },
      data,
    }).then(() => prisma.visit.findFirst({
      where: { id, organizationId },
      include: {
        patient: true,
      }
    }));
  }
}

export const appointmentService = new AppointmentService();
