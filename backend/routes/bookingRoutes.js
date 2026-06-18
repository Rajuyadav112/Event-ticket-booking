const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/reserve
// @desc    Reserve seats for 10 minutes
router.post('/reserve', protect, async (req, res) => {
  try {
    const { eventId, seatNumbers } = req.body;
    
    // Prevent double booking via atomic update
    const updateResult = await Seat.updateMany(
      { 
        eventId, 
        seatNumber: { $in: seatNumbers }, 
        status: 'available' 
      },
      { 
        $set: { status: 'reserved' } 
      }
    );

    if (updateResult.modifiedCount !== seatNumbers.length) {
      // Revert any seats that might have been accidentally reserved if partial success (though updateMany should be consistent based on query, we still revert just in case of race conditions if exact match failed)
      await Seat.updateMany(
        { eventId, seatNumber: { $in: seatNumbers }, status: 'reserved' },
        { $set: { status: 'available' } }
      );
      return res.status(400).json({ message: 'One or more seats became unavailable. Please try again.' });
    }

    // Create reservation
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes from now
    const reservation = await Reservation.create({
      userId: req.user._id,
      eventId,
      seatNumbers,
      expiresAt
    });

    res.json({ reservation, expiresAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Confirm booking
router.post('/bookings', protect, async (req, res) => {
  try {
    const { reservationId } = req.body;
    
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.userId.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: 'Not authorized' });
    }

    if (reservation.expiresAt < new Date()) {
       // Cleanup expired
       await Seat.updateMany(
         { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
         { $set: { status: 'available' } }
       );
       await Reservation.findByIdAndDelete(reservation._id);
       return res.status(400).json({ message: 'Reservation has expired' });
    }

    // Mark seats as booked
    await Seat.updateMany(
      { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
      { $set: { status: 'booked' } }
    );

    // Remove reservation
    await Reservation.findByIdAndDelete(reservation._id);

    res.json({ message: 'Booking confirmed successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
