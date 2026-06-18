const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

// Helper to cleanup expired reservations
const cleanupExpiredReservations = async () => {
  const expired = await Reservation.find({ expiresAt: { $lt: new Date() } });
  if (expired.length > 0) {
    for (let res of expired) {
      await Seat.updateMany(
        { eventId: res.eventId, seatNumber: { $in: res.seatNumbers }, status: 'reserved' },
        { $set: { status: 'available' } }
      );
      await Reservation.findByIdAndDelete(res._id);
    }
  }
};

router.get('/', async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await cleanupExpiredReservations();

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const seats = await Seat.find({ eventId: req.params.id }).sort('seatNumber');
    
    res.json({ event, seats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
