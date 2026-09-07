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
    doctorId: string; // Now required
    facilityId?: string;
    reason: string;
    source: string;
  }) {
    // Check if data.date is already an ISO string containing time information
    const dateTime = data.date.includes('T') ? new Date(data.date) : new Date(`${data.date}T${data.time}:00Z`);

    return await prisma.$transaction(async (tx) => {
      let patientId = data.patientId;

      if (data.isNewPatient) {
        const patient = await tx.patient.create({
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
      if (!data.doctorId) {
        throw new Error("Doctor assignment is required.");
      }

      let doctorName = '';
      const doctorUser = await tx.user.findUnique({ where: { id: data.doctorId } });
      if (doctorUser) {
        doctorName = doctorUser.name;
      } else {
        throw new Error("Invalid doctor ID provided.");
      }

      const visit = await tx.visit.create({
        data: {
          organizationId,
          facilityId: data.facilityId || null,
          patientId: patientId as string,
          date: dateTime,
          doctor: doctorName,
          doctorId: data.doctorId,
          reason: data.reason,
          type: data.source,
          duration: data.duration,
          status: 'Scheduled',
        },
      });

      return visit;
    });
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
