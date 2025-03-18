import React from 'react';
import PropTypes from 'prop-types';

const SETTERS = [
  'Vicky',
  'Vikneswar',
  'Hemaanth',
  'Harneesh',
  'Hitesh',
  'Kumaran',
  'Sethu',
  'Prasanna'
];

const SetterPerformance = ({ appointments = [] }) => {
  const getSetterStats = (setterName) => {
    const setterAppointments = appointments.filter(app => app.setterName === setterName);
    const total = setterAppointments.length;
    
    if (total === 0) {
      return {
        total: 0,
        pitched5k: 0,
        pitched20k: 0,
        wrongNumber: 0,
        wronglyQualified: 0,
        paid: 0,
        rate5k: 0,
        rate20k: 0
      };
    }

    const pitched5k = setterAppointments.filter(app => app.status === '5k_pitched').length;
    const pitched20k = setterAppointments.filter(app => app.status === '20k_pitched').length;
    
    return {
      total,
      pitched5k,
      pitched20k,
      wrongNumber: setterAppointments.filter(app => app.status === 'wrong_number').length,
      wronglyQualified: setterAppointments.filter(app => app.status === 'wrongly_qualified').length,
      paid: setterAppointments.filter(app => app.status === 'paid').length,
      rate5k: ((pitched5k / total) * 100).toFixed(1),
      rate20k: ((pitched20k / total) * 100).toFixed(1)
    };
  };

  const totalStats = {
    total: appointments.length,
    pitched5k: appointments.filter(app => app.status === '5k_pitched').length,
    pitched20k: appointments.filter(app => app.status === '20k_pitched').length,
    wrongNumber: appointments.filter(app => app.status === 'wrong_number').length,
    wronglyQualified: appointments.filter(app => app.status === 'wrongly_qualified').length,
    paid: appointments.filter(app => app.status === 'paid').length,
    rate5k: appointments.length ? ((appointments.filter(app => app.status === '5k_pitched').length / appointments.length) * 100).toFixed(1) : '0.0',
    rate20k: appointments.length ? ((appointments.filter(app => app.status === '20k_pitched').length / appointments.length) * 100).toFixed(1) : '0.0'
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Setter Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Setter</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">10K Pitched</th>
              <th className="px-4 py-2 text-center">10K Rate</th>
              <th className="px-4 py-2 text-center">20K Pitched</th>
              <th className="px-4 py-2 text-center">20K Rate</th>
              <th className="px-4 py-2 text-center">Wrong #</th>
              <th className="px-4 py-2 text-center">Wrong Qual.</th>
              <th className="px-4 py-2 text-center">Paid</th>
            </tr>
          </thead>
          <tbody>
            {SETTERS.map((setter, index) => {
              const stats = getSetterStats(setter);
              return (
                <tr 
                  key={setter}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2">{setter}</td>
                  <td className="px-4 py-2 text-center">{stats.total}</td>
                  <td className="px-4 py-2 text-center">{stats.pitched5k}</td>
                  <td className="px-4 py-2 text-center">{stats.rate5k}%</td>
                  <td className="px-4 py-2 text-center">{stats.pitched20k}</td>
                  <td className="px-4 py-2 text-center">{stats.rate20k}%</td>
                  <td className="px-4 py-2 text-center">{stats.wrongNumber}</td>
                  <td className="px-4 py-2 text-center">{stats.wronglyQualified}</td>
                  <td className="px-4 py-2 text-center">{stats.paid}</td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2 text-center">{totalStats.total}</td>
              <td className="px-4 py-2 text-center">{totalStats.pitched5k}</td>
              <td className="px-4 py-2 text-center">{totalStats.rate5k}%</td>
              <td className="px-4 py-2 text-center">{totalStats.pitched20k}</td>
              <td className="px-4 py-2 text-center">{totalStats.rate20k}%</td>
              <td className="px-4 py-2 text-center">{totalStats.wrongNumber}</td>
              <td className="px-4 py-2 text-center">{totalStats.wronglyQualified}</td>
              <td className="px-4 py-2 text-center">{totalStats.paid}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

SetterPerformance.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    setterName: PropTypes.string.isRequired,
    status: PropTypes.string,
    paymentType: PropTypes.string
  }))
};

export default SetterPerformance;
