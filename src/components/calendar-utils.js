import { format } from 'date-fns';

export const SETTERS = [
  'Vicky',
  'Vikneswar',
  'Hemaanth',
  'Harneesh',
  'Hitesh',
  'Kumaran',
  'Sethu',
  'Prasanna',
  'Sales Person'
];

export const getStatusDisplay = (status) => {
  const display = {
    'picked': 'Picked',
    'didnt_pick': "Didn't Show up",
    'call_later': 'Call Later',
    'will_join_later': 'Will Join Later',
    'ghosted': 'Ghosted',
    '5k_pitched': '10K Pitched',  // Display updated, keeping code same for DB compatibility
    '20k_pitched': '20K Pitched',
    'booked': 'Booked',
    'rescheduled': 'Rescheduled',
    'wrongly_qualified': 'Wrongly Qualified',
    'wrong_number': 'Wrong Number',
    'paid': 'Paid'
  };
  return display[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    'picked': 'bg-purple-500',
    'didnt_pick': 'bg-red-500',
    'call_later': 'bg-blue-500',
    'will_join_later': 'bg-pink-500',
    'ghosted': 'bg-indigo-500',
    '5k_pitched': 'bg-cyan-500',
    '20k_pitched': 'bg-teal-500',
    'booked': 'bg-orange-400',
    'rescheduled': 'bg-amber-500',
    'wrongly_qualified': 'bg-red-300',
    'wrong_number': 'bg-gray-500',
    'paid': 'bg-green-500'
  };
  return colors[status] || 'bg-gray-400';
};

export const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return format(date, 'hh:mm aa');
};

export const createTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 21; hour++) {
    for (let minute of ['00', '30']) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    }
  }
  return slots;
};

export const countSlotsBetweenTimes = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  return Math.floor(totalMinutes / 30);
};

export const calculateSetterStats = (appointments, setter) => {
  // Keep all appointments to count rescheduled
  const setterAppointments = appointments.filter(app => app.setterName === setter);
  
  // Filter active appointments for other stats
  const activeAppointments = setterAppointments.filter(app => app.status !== 'rescheduled');
  
  return {
    total: activeAppointments.length,
    rescheduled: setterAppointments.filter(app => app.status === 'rescheduled').length,
    // Count actual pitch types (including overrides)
    pitch5k: activeAppointments.filter(app => 
      app.status === '5k_pitched' || 
      (app.status === 'paid' && app.pitchedType === '5k_pitched')
    ).length,
    pitch20k: activeAppointments.filter(app => 
      app.status === '20k_pitched' || 
      (app.status === 'paid' && app.pitchedType === '20k_pitched')
    ).length,
    // Initial pitch types set by setter
    initialPitch5k: activeAppointments.filter(app => app.initialPitchType === '5k_pitched').length,
    initialPitch20k: activeAppointments.filter(app => app.initialPitchType === '20k_pitched').length,
    // Other stats
    converted: activeAppointments.filter(app => app.status === 'paid').length,
    converted5k: activeAppointments.filter(app => 
      app.status === 'paid' && 
      app.pitchedType === '5k_pitched' &&
      app.initialPitchType === '5k_pitched'
    ).length,
    converted20k: activeAppointments.filter(app => 
      app.status === 'paid' && 
      app.pitchedType === '20k_pitched' &&
      app.initialPitchType === '20k_pitched'
    ).length,
    didntPick: activeAppointments.filter(app => app.status === 'didnt_pick').length,
    wronglyQualified: activeAppointments.filter(app => app.status === 'wrongly_qualified').length,
    initialPaymentPaid: activeAppointments.filter(app => app.initialPayment === 'paid').length,
    initialPaymentNotPaid: activeAppointments.filter(app => app.initialPayment === 'unpaid').length
  };
};

export const calculateSalesPersonStats = (appointments, salesPerson, selectedDate) => {
  // Filter out rescheduled appointments before calculating stats
  const activeAppointments = appointments.filter(
    app => 
      app.status !== 'rescheduled' && 
      app.salesPerson === salesPerson && 
      app.date.toDateString() === selectedDate.toDateString()
  );

  const booked5k = activeAppointments.filter(app => app.initialPitchType === '5k_pitched').length;
  const booked20k = activeAppointments.filter(app => app.initialPitchType === '20k_pitched').length;

  const totalPitch5k = activeAppointments.filter(app => 
    app.status === '5k_pitched' || 
    (app.status === 'paid' && app.pitchedType === '5k_pitched')
  ).length;

  const totalPitch20k = activeAppointments.filter(app => 
    app.status === '20k_pitched' || 
    (app.status === 'paid' && app.pitchedType === '20k_pitched')
  ).length;

  const payments = activeAppointments.reduce((acc, app) => {
    if (app.paymentType) {
      acc[app.paymentType] = (acc[app.paymentType] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    booked5k,
    booked20k,
    totalPitch5k,
    totalPitch20k,
    payments,
    initialPaymentPaid: activeAppointments.filter(app => app.initialPayment === 'paid').length,
    initialPaymentNotPaid: activeAppointments.filter(app => app.initialPayment === 'unpaid').length
  };
};

export const calculateStats = (appointments, salesPeople, selectedDate) => {
  // Filter today's appointments and exclude rescheduled ones for main stats
  const todayAppointments = appointments.filter(
    app => app.date.toDateString() === selectedDate.toDateString()
  );

  const activeAppointments = todayAppointments.filter(
    app => app.status !== 'rescheduled'
  );

  const totalSlots = salesPeople.reduce((acc, person) => {
    if (!person.isPresent) return acc;
    const slots = countSlotsBetweenTimes(person.startTime, person.endTime);
    return acc + slots;
  }, 0);

  const paymentValues = {
    '5k': 10000,  // Updated from 5000
    '4k': 9000,   // Updated from 4000
    '1k_deposit': 1000,
    '5k_deposit': 5000,
    '6k_sub': 6000,
    '10k': 10000,
    '10k_2nd': 10000,
    '20k': 20000
  };

  const payments = activeAppointments.reduce((acc, app) => {
    if (app.paymentType) {
      acc[app.paymentType] = (acc[app.paymentType] || 0) + 1;
    }
    return acc;
  }, {});

  const totalRevenue = Object.entries(payments).reduce((total, [type, count]) => {
    return total + (paymentValues[type] * count);
  }, 0);

  // Calculate setter statistics - only use active (non-rescheduled) appointments
  const setterStats = {};
  SETTERS.forEach(setter => {
    setterStats[setter] = calculateSetterStats(todayAppointments, setter);
  });

  // Calculate sales person statistics - only use active appointments
  const salesPersonStats = {};
  salesPeople.forEach(person => {
    salesPersonStats[person.name] = calculateSalesPersonStats(todayAppointments, person.name, selectedDate);
  });

  // Count pitch types based on final status or overridden type - exclude rescheduled
  const pitched5k = activeAppointments.filter(app => 
    app.status === '5k_pitched' || 
    (app.status === 'paid' && app.pitchedType === '5k_pitched')
  ).length;

  const pitched20k = activeAppointments.filter(app => 
    app.status === '20k_pitched' || 
    (app.status === 'paid' && app.pitchedType === '20k_pitched')
  ).length;

  // Add initial payment statistics - exclude rescheduled
  const initialPaymentPaid = activeAppointments.filter(app => app.initialPayment === 'paid').length;
  const initialPaymentNotPaid = activeAppointments.filter(app => app.initialPayment === 'unpaid').length;

  // Get total rescheduled count
  const rescheduled = todayAppointments.filter(app => app.status === 'rescheduled').length;

  // Count booked (already excludes rescheduled as we're using activeAppointments)
  const booked = activeAppointments.length;

  return {
    available: totalSlots - booked,
    booked,
    rescheduled,
    initialPaymentPaid,
    initialPaymentNotPaid,
    picked: activeAppointments.filter(app => app.status === 'picked').length,
    didntPick: activeAppointments.filter(app => app.status === 'didnt_pick').length,
    callLater: activeAppointments.filter(app => app.status === 'call_later').length,
    willJoinLater: activeAppointments.filter(app => app.status === 'will_join_later').length,
    ghosted: activeAppointments.filter(app => app.status === 'ghosted').length,
    pitched5k,
    pitched20k,
    wronglyQualified: activeAppointments.filter(app => app.status === 'wrongly_qualified').length,
    wrongNumber: activeAppointments.filter(app => app.status === 'wrong_number').length,
    paid: activeAppointments.filter(app => app.status === 'paid').length,
    total: totalSlots,
    payments,
    totalRevenue,
    setterStats,
    salesPersonStats
  };
};
