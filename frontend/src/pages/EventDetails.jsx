import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock } from 'lucide-react';

function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiration = new Date(expiresAt).getTime();
      const distance = expiration - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
        onExpire();
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#eab308', fontSize: '1.25rem', fontWeight: 'bold' }}>
      <Clock size={20} />
      <span>{timeLeft}</span>
    </div>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(data.event);
      setSeats(data.seats);
    } catch (err) {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber, status) => {
    if (status !== 'available' || reservation) return;
    
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (selectedSeats.length === 0) return;

    setReserving(true);
    setError('');
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/reserve', {
        eventId: id,
        seatNumbers: selectedSeats
      }, config);
      
      setReservation(data);
      // Update local seats state to show as reserved temporarily
      setSeats(seats.map(s => selectedSeats.includes(s.seatNumber) ? { ...s, status: 'reserved' } : s));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve seats. They may have been taken.');
      fetchEventData(); // Refresh seat map
      setSelectedSeats([]);
    } finally {
      setReserving(false);
    }
  };

  const handleBook = async () => {
    if (!reservation) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/bookings', {
        reservationId: reservation.reservation._id
      }, config);
      
      setBookingSuccess(true);
      setReservation(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking.');
    }
  };

  const handleExpire = () => {
    setReservation(null);
    setSelectedSeats([]);
    setError('Reservation expired. Please select seats again.');
    fetchEventData();
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading seat map...</div>;
  if (!event) return <div style={{ textAlign: 'center' }}>Event not found</div>;

  if (bookingSuccess) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <h2 style={{ color: 'var(--accent-color)', marginBottom: '1rem', fontSize: '2rem' }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You have successfully booked {selectedSeats.length} seats for {event.name}.
        </p>
        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Back to Events</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
      <div>
        <h1 style={{ marginBottom: '1rem' }}>{event.name}</h1>
        {error && <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--seat-booked)', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ width: '80%', height: '40px', backgroundColor: 'var(--text-secondary)', margin: '0 auto 2rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
            STAGE
          </div>
          
          <div className="seat-grid">
            {seats.map(seat => {
              const isSelected = selectedSeats.includes(seat.seatNumber);
              return (
                <div 
                  key={seat._id}
                  className={`seat ${seat.status} ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSeat(seat.seatNumber, seat.status)}
                >
                  {seat.seatNumber}
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="seat available" style={{ width: 20, height: 20 }} /> Available</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="seat selected" style={{ width: 20, height: 20 }} /> Selected</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="seat reserved" style={{ width: 20, height: 20 }} /> Reserved</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="seat booked" style={{ width: 20, height: 20 }} /> Booked</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Summary</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
        
        {reservation ? (
          <div>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid var(--seat-reserved)' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Time remaining to complete booking:</p>
              <CountdownTimer expiresAt={reservation.expiresAt} onExpire={handleExpire} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleBook}>
              Confirm Booking
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }} 
            onClick={handleReserve}
            disabled={selectedSeats.length === 0 || reserving}
          >
            {reserving ? 'Reserving...' : 'Reserve Seats'}
          </button>
        )}
      </div>
    </div>
  );
}
