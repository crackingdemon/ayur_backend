import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.patient.deleteMany();

  // Create Patients
  const rahul = await prisma.patient.create({
    data: {
      name: "Rahul Verma",
      age: 45,
      gender: "Male",
      phone: "+91 98765 43210",
      bloodGroup: "O+",
      allergies: "Penicillin, Dust",
      visits: {
        create: {
          date: new Date("2023-10-12T10:00:00Z"),
          doctor: "Dr. Sharma",
          reason: "Joint Pain & Indigestion",
          status: "Completed",
          modernEMR: {
            create: {
              chiefComplaints: "Severe lower back pain (Kati Shoola) radiating to left leg x 2 months. Worsens on sitting for long hours.\nAcidity and incomplete bowel movements x 6 months.",
              hpi: "Patient was apparently well 2 months ago, developed sudden sharp pain after lifting a heavy object. No history of trauma. Pain is aggravating in cold weather and relieving by hot fomentation.",
              pulse: "78 bpm",
              bp: "130/85 mmHg",
              temp: "98.4 F",
              systemicExam: "CVS: S1 S2 normal. RS: B/L clear. CNS: SLR positive on left at 45 degrees.",
              investigations: "MRI LS Spine (12/10/2023): L4-L5 disc bulge with left neural foraminal narrowing."
            }
          },
          ayurvedicEMR: {
            create: {
              prakruti: "Vata-Pitta",
              vikruti: "Vata Pradhana",
              sara: "Madhyama",
              samhanana: "Madhyama",
              vata: 80,
              pitta: 40,
              kapha: 20,
              agni: "Vishama",
              ama: "Sama",
              kostha: "Krura"
            }
          },
          diagnosis: {
            create: {
              provisional: "Lumbar Spondylosis with Radiculopathy (Sciatica)",
              ayurvedicDiagnosis: "Gridhrasi (Vataja)",
              samprapti: "Vata prakopa due to nidana sevana -> sthanasamshraya in Kati Pradesha -> afflicts Kandara of Sphik, Uru, Janu, Jangha -> causes Ruk, Toda, Stambha -> Gridhrasi.",
              chikitsa: "1. Snehana & Swedana (Kati Basti with Mahanarayana Taila).\n2. Mridu Virechana (Eranda Taila).\n3. Basti Karma (Kala Basti).\n4. Shamana Aushadhi: Trayodashanga Guggulu, Rasna Saptaka Kashaya."
            }
          }
        }
      }
    }
  });

  await prisma.patient.create({
    data: { name: "Priya Singh", age: 32, gender: "Female", phone: "+91 87654 32109", visits: { create: { doctor: 'Dr. Sharma', reason: 'Migraine', date: new Date("2023-10-20T10:00:00Z") } } }
  });

  await prisma.patient.create({
    data: { name: "Amit Kumar", age: 50, gender: "Male", phone: "+91 76543 21098", visits: { create: { doctor: 'Dr. Sharma', reason: 'Joint Pain', date: new Date("2023-11-01T10:00:00Z") } } }
  });

  await prisma.patient.create({
    data: { name: "Sunita Sharma", age: 28, gender: "Female", phone: "+91 65432 10987", visits: { create: { doctor: 'Dr. Sharma', reason: 'PCOS', date: new Date("2023-11-05T10:00:00Z") } } }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
