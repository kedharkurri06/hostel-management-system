require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Menu = require('../models/Menu');
const Notice = require('../models/Notice');
const Warden = require('../models/Warden');
const Staff = require('../models/Staff');
const GatePass = require('../models/GatePass');

// Seed Data directly migrated from original data.js
const menuSeed = [
  {
    day: 'Monday',
    breakfast: { time: '7:30 AM - 9:30 AM', items: ['Aloo Paratha with Curd', 'Boiled Eggs / Fruit', 'Tea / Coffee / Milk', 'Cornflakes'], type: 'Veg & Non-Veg options' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Paneer Butter Masala', 'Yellow Dal Tadka', 'Steamed Rice & Chapati', 'Bundi Raita', 'Salad & Papad'], type: 'Veg' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['Veg Samosa', 'Mint Chutney', 'Hot Masala Tea / Coffee'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Kadai Chicken Curry', 'Kadhai Paneer (Veg)', 'Jeera Rice & Butter Naan', 'Gulab Jamun'], type: 'Special Dinner' }
  },
  {
    day: 'Tuesday',
    breakfast: { time: '7:30 AM - 9:30 AM', items: ['Idli & Medu Vada', 'Coconut Chutney & Sambar', 'Tea / Coffee / Milk'], type: 'South Indian Special' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Rajma Masala', 'Jeera Rice & Tawa Roti', 'Mixed Veg Dry', 'Curd & Green Salad'], type: 'Veg' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['Bread Pakora', 'Tomato Ketchup', 'Tea / Coffee'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Egg Curry', 'Mix Veg Korma', 'Rice & Chapati', 'Fruit Custard'], type: 'Veg & Non-Veg' }
  },
  {
    day: 'Wednesday',
    breakfast: { time: '7:30 AM - 9:30 AM', items: ['Poha with Sev & Fried Peanuts', 'Boiled Eggs', 'Sprouts Salad', 'Tea / Coffee'], type: 'Veg & Non-Veg options' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Chole Bhature', 'Jeera Pulao', 'Boondi Raita', 'Pickle & Onions'], type: 'Delicacy' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['Red Sauce Pasta', 'Iced Tea / Hot Tea'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Butter Chicken', 'Shahi Paneer', 'Plain Rice & Butter Tandoori Roti', 'Ice Cream'], type: 'Special Dinner' }
  },
  {
    day: 'Thursday',
    breakfast: { time: '7:30 AM - 9:30 AM', items: ['Masala Dosa', 'Tomato Chutney & Sambar', 'Tea / Coffee'], type: 'Veg' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Kadi Pakoda', 'Jeera Rice', 'Aloo Gobi', 'Papad & Salad'], type: 'Veg' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['Veg Cutlet', 'Green Chutney', 'Tea / Coffee'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Dal Makhani', 'Mix Veg Sabzi', 'Steamed Rice & Chapati', 'Moong Dal Halwa'], type: 'Veg' }
  },
  {
    day: 'Friday',
    breakfast: { time: '7:30 AM - 9:30 AM', items: ['Puri Bhaji', 'Fruit Bowl', 'Tea / Coffee / Milk'], type: 'Veg' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Hyderabadi Veg Biryani', 'Mirchi Ka Salan', 'Raita', 'Papad'], type: 'Special Lunch' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['Bhel Puri', 'Lemonade / Hot Tea'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Fish Curry', 'Malai Kofta (Veg)', 'Jeera Rice & Chapati', 'Kheer'], type: 'Veg & Non-Veg' }
  },
  {
    day: 'Saturday',
    breakfast: { time: '7:30 AM - 9:30 AM', items: ['Uttapam & Coconut Chutney', 'Oatmeal', 'Tea / Coffee'], type: 'Veg' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Aloo Baingan Masala', 'Dal Tadka', 'Rice & Roti', 'Salad'], type: 'Veg' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['French Fries', 'Cold Coffee / Tea'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Pav Bhaji', 'Extra Butter Pav', 'Pulao Rice', 'Rasgulla'], type: 'Weekend Special' }
  },
  {
    day: 'Sunday',
    breakfast: { time: '8:00 AM - 10:00 AM', items: ['Chole Puri', 'Sweet Lassi', 'Fruit Salad', 'Tea / Coffee'], type: 'Sunday Feast' },
    lunch: { time: '12:30 PM - 2:30 PM', items: ['Special Chicken Biryani', 'Paneer Dum Biryani', 'Burani Raita', 'Salad & Gulab Jamun'], type: 'Grand Lunch' },
    snacks: { time: '5:00 PM - 6:00 PM', items: ['Veg Club Sandwich', 'Cold Drink / Tea'], type: 'Veg' },
    dinner: { time: '7:30 PM - 9:30 PM', items: ['Light Khichdi & Aloo Chokha', 'Papad, Ghee & Curd', 'Sewai Kheer'], type: 'Light Dinner' }
  }
];

const complaintSeed = [
  {
    ticketId: 'CMP-1082',
    roomNo: '304',
    block: 'Block A (Boys)',
    category: 'AC',
    priority: 'High',
    status: 'In Progress',
    studentName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    description: 'AC unit is blowing warm air and making a loud rattling sound continuously.',
    visitTimeSlot: '2:00 PM - 5:00 PM',
    assignedTo: 'Ramesh Kumar (HVAC Tech)',
    resolutionNotes: 'Technician assigned. Gas pressure check scheduled for afternoon visit.'
  },
  {
    ticketId: 'CMP-1081',
    roomNo: '112',
    block: 'Block B (Girls)',
    category: 'Water',
    priority: 'Emergency',
    status: 'Pending',
    studentName: 'Ananya Roy',
    phone: '+91 98123 45678',
    description: 'Bathroom pipe leakage causing water overflow into main room floor.',
    visitTimeSlot: 'Immediate / Emergency',
    assignedTo: 'Unassigned',
    resolutionNotes: ''
  },
  {
    ticketId: 'CMP-1078',
    roomNo: '408',
    block: 'Block A (Boys)',
    category: 'Electrical',
    priority: 'Medium',
    status: 'Resolved',
    studentName: 'Vikram Singh',
    phone: '+91 97654 32109',
    description: 'Study desk power socket not supplying electricity. Fuse might be blown.',
    visitTimeSlot: '10:00 AM - 1:00 PM',
    assignedTo: 'Suresh Pal (Electrician)',
    resolutionNotes: 'Replaced 16A modular socket and verified voltage stability.'
  },
  {
    ticketId: 'CMP-1075',
    roomNo: '215',
    block: 'Block C (International)',
    category: 'Wi-Fi',
    priority: 'Low',
    status: 'Resolved',
    studentName: 'David Chen',
    phone: '+91 99887 76655',
    description: 'Wi-Fi access point in 2nd floor corridor drops connection frequently.',
    visitTimeSlot: '5:00 PM - 8:00 PM',
    assignedTo: 'Network Support Desk',
    resolutionNotes: 'Rebooted router AP and updated firmware channel 6.'
  },
  {
    ticketId: 'CMP-1072',
    roomNo: '501',
    block: 'Block B (Girls)',
    category: 'Cleanliness',
    priority: 'Medium',
    status: 'Pending',
    studentName: 'Priya Patel',
    phone: '+91 91234 56789',
    description: 'Deep bathroom cleaning required; sink drain water backing up.',
    visitTimeSlot: '10:00 AM - 1:00 PM',
    assignedTo: 'Unassigned',
    resolutionNotes: ''
  }
];

const wardenSeed = [
  {
    wardenId: 'w1',
    name: 'Dr. Rajeshwar Rao',
    role: 'Chief Warden',
    block: 'All Hostel Blocks',
    phone: '+91 94112 00901',
    email: 'chiefwarden@hostelhub.edu',
    office: 'Admin Building, Room 102',
    hours: '9:00 AM - 5:00 PM (Mon - Sat)',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    wardenId: 'w2',
    name: 'Prof. Sunita Verma',
    role: 'Warden - Girls Hostel',
    block: 'Block B (Girls)',
    phone: '+91 94112 00902',
    email: 'warden.girls@hostelhub.edu',
    office: 'Block B Ground Floor, Office 04',
    hours: '10:00 AM - 6:00 PM',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    wardenId: 'w3',
    name: 'Mr. Anil Kapoor',
    role: 'Warden - Boys Hostel',
    block: 'Block A (Boys)',
    phone: '+91 94112 00903',
    email: 'warden.boys@hostelhub.edu',
    office: 'Block A Ground Floor, Office 01',
    hours: '9:30 AM - 5:30 PM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    wardenId: 'w4',
    name: 'Dr. Marcus Vance',
    role: 'Warden - International Hostel',
    block: 'Block C (International)',
    phone: '+91 94112 00904',
    email: 'warden.int@hostelhub.edu',
    office: 'Block C Admin Desk',
    hours: '11:00 AM - 7:00 PM',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

const staffSeed = [
  { name: 'Ramesh Kumar', designation: 'Chief AC & HVAC Engineer', phone: '+91 98111 22334', availability: 'On Duty (8 AM - 8 PM)' },
  { name: 'Suresh Pal', designation: 'Head Electrician', phone: '+91 98222 33445', availability: '24x7 Emergency On-Call' },
  { name: 'Mahesh Yadav', designation: 'Senior Plumber', phone: '+91 98333 44556', availability: 'On Duty (7 AM - 6 PM)' },
  { name: 'Mess Manager Desk', designation: 'Hostel Dining Services', phone: '+91 98444 55667', availability: '6:30 AM - 10:00 PM' },
  { name: 'Main Security Control', designation: '24/7 Security Gate', phone: '+91 98555 66778', availability: '24x7 Available' }
];

const noticeSeed = [
  {
    title: 'Scheduled Water Tank Cleaning & Pipe Maintenance',
    date: 'July 31, 2026',
    category: 'Maintenance',
    priority: 'High',
    content: 'Water supply to Block A and Block B will be suspended from 10:00 AM to 2:00 PM for annual overhead tank disinfection. Please store required water in advance.'
  },
  {
    title: 'Mess Menu Special Request Drive & Survey',
    date: 'July 29, 2026',
    category: 'Mess & Food',
    priority: 'Normal',
    content: 'Students can submit special dish requests for Sunday grand lunches through the mess feedback box in the dining hall.'
  },
  {
    title: 'AC Filter Servicing Drive - Block A & B',
    date: 'July 28, 2026',
    category: 'HVAC',
    priority: 'Normal',
    content: 'Technicians will conduct room-by-room AC filter cleaning this weekend. Please keep your rooms accessible during your selected time slots.'
  }
];

const seedDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_management';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB for seeding');

    // 1. Seed Users (idempotent: find or create, never reset existing passwords)
    const adminEmail = 'warden@hostelhub.edu';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({ name: 'Head Warden Admin', email: adminEmail, password: 'WardenPass123!', role: 'warden' });
      console.log(`✅ Created default warden user: ${adminEmail} / WardenPass123!`);
    } else {
      console.log(`ℹ️ Default warden user already exists: ${adminEmail}`);
    }

    const studentEmail = 'student@hostelhub.edu';
    let studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
      studentUser = await User.create({ name: 'Rahul Sharma', email: studentEmail, password: 'StudentPass123!', role: 'student' });
      console.log(`✅ Created default student user: ${studentEmail} / StudentPass123!`);
    } else {
      console.log(`ℹ️ Default student user already exists: ${studentEmail}`);
    }

    // Demo account: VTU28892 (student) — as requested
    const vtuStudentEmail = 'VTU28892@hostelhub.edu';
    let vtuStudent = await User.findOne({ email: vtuStudentEmail.toLowerCase() });
    if (!vtuStudent) {
      vtuStudent = await User.create({ name: 'VTU Student (28892)', email: vtuStudentEmail.toLowerCase(), password: 'VTU28892', role: 'student' });
      console.log(`✅ Created VTU student demo: ${vtuStudentEmail} / VTU28892`);
    } else {
      console.log(`ℹ️ VTU student demo already exists: ${vtuStudentEmail}`);
    }

    // Demo account: warden@vtu (warden) — as requested
    const vtuWardenUsername = 'warden@vtu';
    let vtuWarden = await User.findOne({
      $or: [
        { username: vtuWardenUsername },
        { email: 'warden@vtu.edu' }
      ]
    }).select('+password');
    if (!vtuWarden) {
      vtuWarden = await User.create({
        name: 'VTU Warden Admin',
        username: vtuWardenUsername,
        email: 'warden@vtu.edu',
        password: 'warden@123',
        role: 'warden'
      });
      console.log(`✅ Created VTU warden demo: ${vtuWardenUsername} / warden@123`);
    } else {
      let needsSave = false;
      if (vtuWarden.username !== vtuWardenUsername) {
        vtuWarden.username = vtuWardenUsername;
        needsSave = true;
      }
      const matches = await vtuWarden.comparePassword('warden@123');
      if (!matches) {
        vtuWarden.password = 'warden@123';
        needsSave = true;
      }
      if (needsSave) {
        await vtuWarden.save();
        console.log(`✅ Updated VTU warden credentials to: ${vtuWardenUsername} / warden@123`);
      } else {
        console.log(`ℹ️ VTU warden demo already exists: ${vtuWardenUsername}`);
      }
    }

    // 2. Seed Menus
    for (const m of menuSeed) {
      await Menu.findOneAndUpdate(
        { day: m.day },
        { $set: m },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${menuSeed.length} weekly menu schedules`);

    // 3. Seed Complaints
    for (const c of complaintSeed) {
      await Complaint.findOneAndUpdate(
        { ticketId: c.ticketId },
        { $set: c },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${complaintSeed.length} initial complaints`);

    // 4. Seed Wardens
    for (const w of wardenSeed) {
      await Warden.findOneAndUpdate(
        { wardenId: w.wardenId },
        { $set: w },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${wardenSeed.length} warden directory profiles`);

    // 5. Seed Staff
    for (const s of staffSeed) {
      await Staff.findOneAndUpdate(
        { name: s.name },
        { $set: s },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${staffSeed.length} maintenance technician contacts`);

    // 6. Seed Notices
    for (const n of noticeSeed) {
      await Notice.findOneAndUpdate(
        { title: n.title },
        { $set: n },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${noticeSeed.length} notices`);

    console.log('\n🎉 Idempotent database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n⚠️ MongoDB Atlas Connection Notice:');
    console.error(err.message);
    console.log('\n-----------------------------------------------------------');
    console.log('📌 TO CONNECT YOUR MONGODB ATLAS CLUSTER:');
    console.log('1. Log in to https://cloud.mongodb.com');
    console.log('2. Click "Network Access" under "Security" in the left menu');
    console.log('3. Click "+ Add IP Address" and select "Allow Access from Anywhere" (0.0.0.0/0)');
    console.log('4. Click "Confirm"');
    console.log('-----------------------------------------------------------');
    console.log('💡 Note: The application is currently running with built-in fallback data,');
    console.log('   so your full portal works right now at http://localhost:5173 !');
    console.log('-----------------------------------------------------------\n');
    process.exit(0);
  }
};

seedDB();
