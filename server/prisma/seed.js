const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 12);

  // Create admin
  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@sehat.com', password, role: 'ADMIN', isVerified: true },
  });

  // Create doctors
  const doctors = [
    { name: 'Dr. Rajesh Sharma', email: 'rajesh@sehat.com', specialty: 'General Medicine', qualification: 'MBBS, MD', experience: 15, fee: 500, rating: 4.8, reviews: 127, bio: 'Senior physician with 15 years of experience in internal medicine.', languages: ['English', 'Hindi'], hospital: 'Apollo Hospital' },
    { name: 'Dr. Priya Kaur', email: 'priya@sehat.com', specialty: 'Pediatrics', qualification: 'MBBS, DCH', experience: 10, fee: 600, rating: 4.9, reviews: 89, bio: 'Child specialist passionate about pediatric care.', languages: ['English', 'Hindi', 'Punjabi'], hospital: 'Max Healthcare' },
    { name: 'Dr. Amit Singh', email: 'amit@sehat.com', specialty: 'Cardiology', qualification: 'MBBS, DM Cardiology', experience: 20, fee: 1000, rating: 4.7, reviews: 156, bio: 'Expert cardiologist specializing in interventional cardiology.', languages: ['English', 'Hindi'], hospital: 'Fortis Hospital' },
    { name: 'Dr. Sneha Patel', email: 'sneha@sehat.com', specialty: 'Dermatology', qualification: 'MBBS, MD Dermatology', experience: 8, fee: 700, rating: 4.6, reviews: 93, bio: 'Dermatologist specializing in cosmetic and clinical dermatology.', languages: ['English', 'Hindi', 'Gujarati'], hospital: 'Skin Care Clinic' },
    { name: 'Dr. Vikram Reddy', email: 'vikram@sehat.com', specialty: 'Orthopedics', qualification: 'MBBS, MS Ortho', experience: 12, fee: 800, rating: 4.5, reviews: 78, bio: 'Orthopedic surgeon with expertise in joint replacement.', languages: ['English', 'Hindi', 'Telugu'], hospital: 'AIIMS' },
    { name: 'Dr. Anjali Gupta', email: 'anjali@sehat.com', specialty: 'Gynecology', qualification: 'MBBS, MS OBG', experience: 14, fee: 900, rating: 4.8, reviews: 112, bio: 'Experienced gynecologist and obstetrician.', languages: ['English', 'Hindi'], hospital: 'Safdarjung Hospital' },
    { name: 'Dr. Arjun Nair', email: 'arjun@sehat.com', specialty: 'Neurology', qualification: 'MBBS, DM Neuro', experience: 18, fee: 1200, rating: 4.9, reviews: 67, bio: 'Neurologist specializing in stroke and epilepsy management.', languages: ['English', 'Malayalam'], hospital: 'Medanta Hospital' },
    { name: 'Dr. Fatima Khan', email: 'fatima@sehat.com', specialty: 'Psychiatry', qualification: 'MBBS, MD Psychiatry', experience: 11, fee: 800, rating: 4.7, reviews: 54, bio: 'Mental health expert with focus on anxiety and depression.', languages: ['English', 'Hindi', 'Urdu'], hospital: 'Mind Wellness Clinic' },
  ];

  for (const doc of doctors) {
    const user = await prisma.user.create({
      data: { name: doc.name, email: doc.email, password, role: 'DOCTOR', isVerified: true, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0D7377&color=fff&size=200` },
    });
    await prisma.doctorProfile.create({
      data: { userId: user.id, specialty: doc.specialty, qualification: doc.qualification, experience: doc.experience, consultationFee: doc.fee, rating: doc.rating, totalReviews: doc.reviews, bio: doc.bio, languages: doc.languages, isAvailable: true, hospitalName: doc.hospital },
    });
  }

  // Create patients
  const patients = [
    { name: 'Rahul Kumar', email: 'patient@sehat.com' },
    { name: 'Meera Joshi', email: 'meera@sehat.com' },
    { name: 'Sanjay Verma', email: 'sanjay@sehat.com' },
  ];

  for (const pat of patients) {
    const user = await prisma.user.create({
      data: { name: pat.name, email: pat.email, password, role: 'PATIENT', isVerified: true, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pat.name)}&background=14FFEC&color=0D7377&size=200` },
    });
    await prisma.patientProfile.create({ data: { userId: user.id, gender: 'Male', bloodGroup: 'O+' } });
  }

  // Medicines
  const medicines = [
    { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', manufacturer: 'Cipla', price: 25, mrp: 35, discount: 28, category: 'Pain Relief', description: 'Fever and pain relief tablet', dosageForm: 'Tablet', strength: '500mg', packSize: 'Strip of 10' },
    { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', manufacturer: 'Sun Pharma', price: 85, mrp: 110, discount: 23, category: 'Antibiotics', description: 'Broad-spectrum antibiotic', dosageForm: 'Capsule', strength: '250mg', packSize: 'Strip of 10', requiresPrescription: true },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', manufacturer: 'Dr. Reddy\'s', price: 30, mrp: 45, discount: 33, category: 'Allergy', description: 'Anti-allergy tablet', dosageForm: 'Tablet', strength: '10mg', packSize: 'Strip of 10' },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', manufacturer: 'Zydus', price: 65, mrp: 90, discount: 28, category: 'Digestive', description: 'Acid reflux and ulcer treatment', dosageForm: 'Capsule', strength: '20mg', packSize: 'Strip of 15' },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', manufacturer: 'USV', price: 45, mrp: 60, discount: 25, category: 'Diabetes', description: 'Type 2 diabetes management', dosageForm: 'Tablet', strength: '500mg', packSize: 'Strip of 10', requiresPrescription: true },
    { name: 'Azithromycin 500mg', genericName: 'Azithromycin', manufacturer: 'Alkem', price: 120, mrp: 160, discount: 25, category: 'Antibiotics', description: 'Macrolide antibiotic for infections', dosageForm: 'Tablet', strength: '500mg', packSize: 'Strip of 3', requiresPrescription: true },
    { name: 'Vitamin D3 60K', genericName: 'Cholecalciferol', manufacturer: 'Cadila', price: 120, mrp: 150, discount: 20, category: 'Vitamins', description: 'Vitamin D supplement', dosageForm: 'Capsule', strength: '60000 IU', packSize: 'Strip of 4' },
    { name: 'Dolo 650', genericName: 'Paracetamol', manufacturer: 'Micro Labs', price: 30, mrp: 35, discount: 14, category: 'Pain Relief', description: 'Pain and fever relief', dosageForm: 'Tablet', strength: '650mg', packSize: 'Strip of 15' },
    { name: 'Pan-D', genericName: 'Pantoprazole + Domperidone', manufacturer: 'Alkem', price: 95, mrp: 130, discount: 27, category: 'Digestive', description: 'Acidity and bloating relief', dosageForm: 'Capsule', strength: '40mg+30mg', packSize: 'Strip of 10' },
    { name: 'Crocin Advance', genericName: 'Paracetamol', manufacturer: 'GSK', price: 22, mrp: 28, discount: 21, category: 'Pain Relief', description: 'Fast fever and pain relief', dosageForm: 'Tablet', strength: '500mg', packSize: 'Strip of 15' },
    { name: 'Limcee', genericName: 'Vitamin C', manufacturer: 'Abbott', price: 30, mrp: 36, discount: 17, category: 'Vitamins', description: 'Vitamin C chewable tablets', dosageForm: 'Chewable Tablet', strength: '500mg', packSize: 'Bottle of 15' },
    { name: 'ORS Powder', genericName: 'Oral Rehydration Salts', manufacturer: 'Electral', price: 22, mrp: 27, discount: 19, category: 'Digestive', description: 'Oral rehydration solution', dosageForm: 'Powder', strength: '21.8g', packSize: 'Pack of 4' },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({ data: med });
  }

  // Pharmacies
  const pharmacies = [
    { name: 'MedPlus Pharmacy', address: '123 MG Road, Delhi', phone: '+91 98765 43210', rating: 4.5, openTime: '08:00', closeTime: '22:00' },
    { name: 'Apollo Pharmacy', address: '456 Nehru Place, Delhi', phone: '+91 98765 43211', rating: 4.7, openTime: '24/7', closeTime: '24/7' },
    { name: 'Netmeds Store', address: '789 Connaught Place, Delhi', phone: '+91 98765 43212', rating: 4.3, openTime: '09:00', closeTime: '21:00' },
    { name: 'PharmEasy Outlet', address: '321 Saket, Delhi', phone: '+91 98765 43213', rating: 4.6, openTime: '08:00', closeTime: '23:00' },
  ];

  for (const p of pharmacies) {
    await prisma.pharmacy.create({ data: p });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo Credentials:');
  console.log('   Patient: patient@sehat.com / password123');
  console.log('   Doctor:  rajesh@sehat.com / password123');
  console.log('   Admin:   admin@sehat.com / password123\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
