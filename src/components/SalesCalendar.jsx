import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  saveAppointment, 
  deleteAppointment, 
  subscribeToAppointments,
  saveAttendanceStatus,
  subscribeToAttendance,
  loadAttendanceStatus 
} from '../firebase';
import { formatTime, createTimeSlots, calculateStats, getStatusDisplay, getStatusColor } from './calendar-utils';
import AppointmentForm from './forms/AppointmentForm';
import StatusForm from './forms/StatusForm';
import AppointmentTooltip from './AppointmentTooltip';
import SetterPerformance from './SetterPerformance';
import LeadSourcePerformance from './LeadSourcePerformance';
import SalesPersonPerformance from './SalesPersonPerformance';

const DEFAULT_SALES_PEOPLE = [
  { name: "Harsha", startTime: "11:00", endTime: "20:00", isPresent: true },
  { name: "Mani", startTime: "11:00", endTime: "19:00", isPresent: true },
  { name: "Monish", startTime: "17:00", endTime: "21:00", isPresent: true },
  { name: "Pranav", startTime: "09:30", endTime: "14:00", isPresent: true },
  { name: "Tamil", startTime: "11:00", endTime: "20:00", isPresent: true }
];

const SalesCalendar = () => {
  const [salesPeople, setSalesPeople] = useState(DEFAULT_SALES_PEOPLE);
  const [appointments, setAppointments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hoveredAppointment, setHoveredAppointment] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unavailableSlots, setUnavailableSlots] = useState({});

  const timeSlots = useMemo(() => createTimeSlots(), []);

  // Load initial attendance status for the selected date
  useEffect(() => {
    const loadInitialAttendance = async () => {
      const savedAttendance = await loadAttendanceStatus(selectedDate);
      if (savedAttendance) {
        setSalesPeople(savedAttendance);
      } else {
        setSalesPeople(DEFAULT_SALES_PEOPLE);
      }
    };
    loadInitialAttendance();
  }, [selectedDate]);

  // Subscribe to attendance changes for the selected date
  useEffect(() => {
    const unsubscribe = subscribeToAttendance((updatedSalesPeople) => {
      if (updatedSalesPeople) {
        setSalesPeople(updatedSalesPeople);
      } else {
        setSalesPeople(DEFAULT_SALES_PEOPLE);
      }
    }, selectedDate);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedDate]);

  // Firebase appointments subscription
  useEffect(() => {
    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleBookAppointment = useCallback(async (formData) => {
    const newAppointment = {
      id: Date.now(),
      ...formData,
      status: 'booked',
      date: new Date(selectedDate)
    };

    try {
      await saveAppointment(newAppointment);
      setShowBookingForm(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  }, [selectedDate]);

  const handleUpdateStatus = useCallback(async (appointmentId, updates) => {
    try {
      if (updates.status === null) {
        await deleteAppointment(appointmentId);
      } else {
        const appointment = appointments.find(app => app.id === appointmentId);
        if (appointment) {
          await saveAppointment({
            ...appointment,
            ...updates
          });
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }, [appointments]);

  const handleReschedule = useCallback(async (newAppointment) => {
    try {
      await saveAppointment({
        ...newAppointment,
        date: new Date(selectedDate)
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  }, [selectedDate]);

  const toggleAttendance = async (index) => {
    const person = salesPeople[index];
    
    if (person.isPresent) {
      const input = window.prompt(
        `Type 'absent' to mark ${person.name} as absent:`
      );
      
      if (input && input.toLowerCase().trim() === 'absent') {
        const updatedPeople = salesPeople.map((p, i) => 
          i === index ? { ...p, isPresent: false } : p
        );
        setSalesPeople(updatedPeople);
        try {
          await saveAttendanceStatus(updatedPeople, selectedDate);
        } catch (error) {
          console.error('Error saving attendance:', error);
          setSalesPeople(salesPeople);
          alert('Error saving attendance status. Please try again.');
        }
      }
    } else {
      const shouldUpdate = window.confirm(`Mark ${person.name} as present?`);
      
      if (shouldUpdate) {
        const updatedPeople = salesPeople.map((p, i) => 
          i === index ? { ...p, isPresent: true } : p
        );
        setSalesPeople(updatedPeople);
        try {
          await saveAttendanceStatus(updatedPeople, selectedDate);
        } catch (error) {
          console.error('Error saving attendance:', error);
          setSalesPeople(salesPeople);
          alert('Error saving attendance status. Please try again.');
        }
      }
    }
  };

  const handleSlotClick = (person, time, isUnavailable) => {
    const slotKey = `${person.name}-${time}-${selectedDate.toDateString()}`;
    if (isUnavailable || unavailableSlots[slotKey]) {
      const confirmBook = window.confirm(
        'This slot is marked as unavailable. Would you still like to book it?'
      );
      if (!confirmBook) return;
    }
    setSelectedSlot({ person, time, isUnavailable });
    setShowBookingForm(true);
  };

  const toggleUnavailable = (person, time) => {
    const slotKey = `${person.name}-${time}-${selectedDate.toDateString()}`;
    setUnavailableSlots(prev => ({
      ...prev,
      [slotKey]: !prev[slotKey]
    }));
  };

  const stats = useMemo(() => calculateStats(appointments, salesPeople, selectedDate, unavailableSlots), 
    [appointments, salesPeople, selectedDate, unavailableSlots]);

  const todayAppointments = useMemo(() => 
    appointments.filter(app => app.date.toDateString() === selectedDate.toDateString()),
    [appointments, selectedDate]
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Date selector */}
      <div className="mb-4">
        <input
          type="date"
          className="border p-2 rounded"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={e => handleDateChange(new Date(e.target.value))}
        />
      </div>

      {/* Main booking table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50">Time</th>
              {salesPeople.map((person, index) => (
                <th key={person.name} className="border p-2 bg-gray-50 min-w-[150px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex-grow ${!person.isPresent ? 'text-red-500 line-through' : ''}`}>
                      {person.name}
                    </span>
                    <button
                      onClick={() => toggleAttendance(index)}
                      className={`w-4 h-4 ${
                        person.isPresent 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}
                      title={person.isPresent ? "Mark as Absent" : "Mark as Present"}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(person.startTime)} - {formatTime(person.endTime)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="border p-2 font-medium">{formatTime(time)}</td>
                {salesPeople.map(person => {
                  const appointment = appointments.find(
                    app => 
                      app.salesPerson === person.name && 
                      app.time === time &&
                      app.date.toDateString() === selectedDate.toDateString()
                  );
                  const slotKey = `${person.name}-${time}-${selectedDate.toDateString()}`;
                  const isTimeAvailable = time >= person.startTime && 
                                        time < person.endTime && 
                                        person.isPresent;

                  return (
                    <td 
                      key={`${person.name}-${time}`} 
                      className="border p-2 text-center relative"
                    >
                      {appointment ? (
                        <button
                          className={`w-full p-2 rounded text-white ${getStatusColor(appointment.status)}`}
                          onMouseEnter={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            setHoveredAppointment({
                              appointment,
                              position: {
                                x: rect.left,
                                y: rect.bottom + window.scrollY
                              }
                            });
                          }}
                          onMouseLeave={() => setHoveredAppointment(null)}
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowStatusForm(true);
                          }}
                        >
                          {getStatusDisplay(appointment.status)}
                        </button>
                      ) : (
                        <div className="relative">
                          <button
                            className={`w-full p-2 ${
                              isTimeAvailable && !unavailableSlots[slotKey]
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-gray-400 hover:bg-gray-500'
                            } text-white rounded`}
                            onClick={() => handleSlotClick(person, time, !isTimeAvailable || unavailableSlots[slotKey])}
                          >
                            {isTimeAvailable && !unavailableSlots[slotKey] ? 'Available' : 'Unavailable'}
                          </button>
                          {isTimeAvailable && (
                            <button
                              className={`absolute top-0 right-0 -mr-0.5 -mt-0.5 ${
                                unavailableSlots[slotKey] 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-black/20 hover:bg-black/30'
                              } text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center`}
                              onClick={() => toggleUnavailable(person, time)}
                              title={unavailableSlots[slotKey] ? "Mark as Available" : "Mark as Unavailable"}
                            >
                              {unavailableSlots[slotKey] ? '✓' : '×'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sales Statistics */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h2 className="text-lg font-bold mb-4">Sales Summary</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-green-100 p-3 rounded">
            <div className="text-lg">Available</div>
            <div className="text-2xl font-bold">{stats.available}</div>
          </div>
          <div className="bg-orange-100 p-3 rounded">
            <div className="text-lg">Booked</div>
            <div className="text-2xl font-bold">{stats.booked}</div>
          </div>
          <div className="bg-emerald-100 p-3 rounded">
            <div className="text-lg">1.50 Paid</div>
            <div className="text-2xl font-bold">{stats.initialPaymentPaid}</div>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <div className="text-lg">1.50 Not Paid</div>
            <div className="text-2xl font-bold">{stats.initialPaymentNotPaid}</div>
          </div>
          <div className="bg-amber-100 p-3 rounded">
            <div className="text-lg">Rescheduled</div>
            <div className="text-2xl font-bold">{stats.rescheduled}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded">
            <div className="text-lg">Picked</div>
            <div className="text-2xl font-bold">{stats.picked}</div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="bg-red-100 p-3 rounded">
            <div className="text-lg">Didn't Show up</div>
            <div className="text-2xl font-bold">{stats.didntPick}</div>
          </div>
          <div className="bg-blue-100 p-3 rounded">
            <div className="text-lg">Call Later</div>
            <div className="text-2xl font-bold">{stats.callLater}</div>
          </div>
          <div className="bg-pink-100 p-3 rounded">
            <div className="text-lg">Will Join Later</div>
            <div className="text-2xl font-bold">{stats.willJoinLater}</div>
          </div>
          <div className="bg-indigo-100 p-3 rounded">
            <div className="text-lg">Ghosted</div>
            <div className="text-2xl font-bold">{stats.ghosted}</div>
          </div>
          <div className="bg-cyan-100 p-3 rounded">
            <div className="text-lg">10K Pitched</div>
            <div className="text-2xl font-bold">{stats.pitched5k}</div>
          </div>
          <div className="bg-teal-100 p-3 rounded">
            <div className="text-lg">20K Pitched</div>
            <div className="text-2xl font-bold">{stats.pitched20k}</div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4 mt-4">
          <div className="bg-green-100 p-3 rounded">
            <div className="text-lg">Paid</div>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </div>
          <div className="bg-red-100 p-3 rounded">
            <div className="text-lg">Wrongly Qual.</div>
            <div className="text-2xl font-bold">{stats.wronglyQualified}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-lg">Wrong Number</div>
            <div className="text-2xl font-bold">{stats.wrongNumber}</div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">10K</div>
              <div className="text-xl font-bold">{stats.payments['5k'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">9K</div>
              <div className="text-xl font-bold">{stats.payments['4k'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">1000 Deposit</div>
              <div className="text-xl font-bold">{stats.payments['1k_deposit'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">5000 Deposit</div>
              <div className="text-xl font-bold">{stats.payments['5k_deposit'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">6000 Sub</div>
              <div className="text-xl font-bold">{stats.payments['6k_sub'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">10K</div>
              <div className="text-xl font-bold">{stats.payments['10k'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">10K 2nd Ins</div>
              <div className="text-xl font-bold">{stats.payments['10k_2nd'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">20K</div>
              <div className="text-xl font-bold">{stats.payments['20k'] || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-lg">5K Split</div>
              <div className="text-xl font-bold">{stats.payments['5k_split'] || 0}</div>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <div className="text-lg">Total Revenue</div>
              <div className="text-xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Person Performance */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <SalesPersonPerformance salesPersonStats={stats.salesPersonStats} />
      </div>

      {/* Setter Performance */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <SetterPerformance appointments={todayAppointments} />
      </div>

      {/* Lead Source Performance */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <LeadSourcePerformance leadSourceStats={stats.leadSourceStats} />
      </div>

      {/* Forms */}
      {showBookingForm && selectedSlot && (
        <AppointmentForm
          salesPerson={selectedSlot.person.name}
          time={selectedSlot.time}
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleBookAppointment}
          isUnavailable={selectedSlot.isUnavailable}
        />
      )}

      {showStatusForm && selectedAppointment && (
        <StatusForm
          appointment={selectedAppointment}
          onClose={() => {
            setShowStatusForm(false);
            setSelectedAppointment(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onReschedule={handleReschedule}
          salesPeople={salesPeople}
        />
      )}

      {/* Tooltip */}
      {hoveredAppointment && (
        <AppointmentTooltip
          appointment={hoveredAppointment.appointment}
          position={hoveredAppointment.position}
        />
      )}
    </div>
  );
};

export default SalesCalendar;
