import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/events');
        setEvents(data);
      } catch (err) {
        setError('Failed to load events. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading events...</div>;
  if (error) return <div style={{ color: 'var(--seat-booked)', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: '700' }}>Upcoming Events</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {events.map(event => (
          <div key={event._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '200px', width: '100%', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              )}
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{event.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <Calendar size={16} />
                <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <MapPin size={16} />
                <span>{event.venue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <Users size={16} />
                <span>{event.totalSeats} Total Seats</span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <Link to={`/events/${event._id}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                  Book Tickets
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
