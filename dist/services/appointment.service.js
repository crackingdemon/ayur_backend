"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentService = exports.AppointmentService = void 0;
const prisma_1 = require("../lib/prisma");
class AppointmentService {
    async bookAppointment(organizationId, data) {
        // Check if data.date is already an ISO string containing time information
        const dateTime = data.date.includes('T') ? new Date(data.date) : new Date(`${data.date}T${data.time}:00Z`);
        return await prisma_1.prisma.$transaction(async (tx) => {
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
            }
            else if (!patientId) {
                throw new Error("Patient ID is required for existing patients.");
            }
            if (!data.doctorId) {
                throw new Error("Doctor assignment is required.");
            }
            let doctorName = '';
            const doctorUser = await tx.user.findUnique({ where: { id: data.doctorId } });
            if (doctorUser) {
                doctorName = doctorUser.name;
            }
            else {
                throw new Error("Invalid doctor ID provided.");
            }
            const visit = await tx.visit.create({
                data: {
                    organizationId,
                    facilityId: data.facilityId || null,
                    patientId: patientId,
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
    async getAppointmentsToday(organizationId, dateString) {
        let today;
        let tomorrow;
        if (dateString) {
            today = new Date(`${dateString}T00:00:00Z`);
            tomorrow = new Date(`${dateString}T00:00:00Z`);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        }
        else {
            today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            tomorrow = new Date(today);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        }
        return await prisma_1.prisma.visit.findMany({
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
    async getAppointmentsPaginated(organizationId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            prisma_1.prisma.visit.findMany({
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
            prisma_1.prisma.visit.count({ where: { organizationId } })
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
    async updateStatus(organizationId, id, status) {
        const data = { status };
        if (status === 'Waiting') {
            data.checkInTime = new Date();
        }
        else if (status === 'Completed' || status === 'Cancelled') {
            data.checkoutTime = new Date();
        }
        return await prisma_1.prisma.visit.updateMany({
            where: { id, organizationId },
            data,
        }).then(() => prisma_1.prisma.visit.findFirst({
            where: { id, organizationId },
            include: {
                patient: true,
            }
        }));
    }
}
exports.AppointmentService = AppointmentService;
exports.appointmentService = new AppointmentService();
