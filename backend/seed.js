const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Seat = require('./models/Seat');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-booking';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Event.deleteMany();
    await Seat.deleteMany();

    const event = await Event.create({
      name: 'Tech Conference 2026',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      venue: 'Grand Convention Center',
      totalSeats: 100,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    });

    const event2 = await Event.create({
      name: 'Music Festival',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      venue: 'Open Air Arena',
      totalSeats: 60,
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    });

    // Create 100 seats for Event 1 (10 rows of 10)
    const seatsToInsert1 = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    for (let r = 0; r < 10; r++) {
      for (let c = 1; c <= 10; c++) {
        seatsToInsert1.push({
          eventId: event._id,
          seatNumber: `${rows[r]}${c}`,
          status: 'available'
        });
      }
    }
    await Seat.insertMany(seatsToInsert1);

    // Create 60 seats for Event 2 (6 rows of 10)
    const seatsToInsert2 = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 1; c <= 10; c++) {
        seatsToInsert2.push({
          eventId: event2._id,
          seatNumber: `${rows[r]}${c}`,
          status: 'available'
        });
      }
    }
    await Seat.insertMany(seatsToInsert2);

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
