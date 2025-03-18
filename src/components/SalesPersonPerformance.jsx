import React from 'react';
import PropTypes from 'prop-types';

const SalesPersonPerformance = ({ appointments = [], salesPeople = [] }) => {
  const getStats = (salesPerson) => {
    const personAppointments = appointments.filter(app => app.salesPerson === salesPerson);
    
    return {
      total: personAppointments.length,
      picked: personAppointments.filter(app => app.status === 'picked').length,
      didntPick: personAppointments.filter(app => app.status === 'didnt_pick').length,
      pitched5k: personAppointments.filter(app => app.status === '5k_pitched').length,
      pitched20k: personAppointments.filter(app => app.status === '20k_pitched').length,
      paid: personAppointments.filter(app => app.status === 'paid').length,
      revenue: personAppointments.reduce((total, app) => {
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
        return total + (app.paymentType ? paymentValues[app.paymentType] || 0 : 0);
      }, 0)
    };
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Sales Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Sales Person</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">Picked</th>
              <th className="px-4 py-2 text-center">Didn't Show up</th>
              <th className="px-4 py-2 text-center">10K Pitched</th>
              <th className="px-4 py-2 text-center">20K Pitched</th>
              <th className="px-4 py-2 text-center">Paid</th>
              <th className="px-4 py-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesPeople.map((person, index) => {
              const stats = getStats(person.name);
              return (
                <tr 
                  key={person.name}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2">{person.name}</td>
                  <td className="px-4 py-2 text-center">{stats.total}</td>
                  <td className="px-4 py-2 text-center">{stats.picked}</td>
                  <td className="px-4 py-2 text-center">{stats.didntPick}</td>
                  <td className="px-4 py-2 text-center">{stats.pitched5k}</td>
                  <td className="px-4 py-2 text-center">{stats.pitched20k}</td>
                  <td className="px-4 py-2 text-center">{stats.paid}</td>
                  <td className="px-4 py-2 text-right">₹{stats.revenue.toLocaleString()}</td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2 text-center">
                {appointments.length}
              </td>
              <td className="px-4 py-2 text-center">
                {appointments.filter(app => app.status === 'picked').length}
              </td>
              <td className="px-4 py-2 text-center">
                {appointments.filter(app => app.status === 'didnt_pick').length}
              </td>
              <td className="px-4 py-2 text-center">
                {appointments.filter(app => app.status === '5k_pitched').length}
              </td>
              <td className="px-4 py-2 text-center">
                {appointments.filter(app => app.status === '20k_pitched').length}
              </td>
              <td className="px-4 py-2 text-center">
                {appointments.filter(app => app.status === 'paid').length}
              </td>
              <td className="px-4 py-2 text-right">
                ₹{appointments.reduce((total, app) => {
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
                  return total + (app.paymentType ? paymentValues[app.paymentType] || 0 : 0);
                }, 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

SalesPersonPerformance.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    salesPerson: PropTypes.string.isRequired,
    status: PropTypes.string,
    paymentType: PropTypes.string
  })),
  salesPeople: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    isPresent: PropTypes.bool
  }))
};

export default SalesPersonPerformance;
