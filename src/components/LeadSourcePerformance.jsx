import React from 'react';
import PropTypes from 'prop-types';

const LeadSourcePerformance = ({ leadSourceStats }) => {
  const { ads, youtube } = leadSourceStats;

  // Calculate totals
  const totals = {
    stats10k: {
      scheduled: ads.stats10k.scheduled + youtube.stats10k.scheduled,
      showUp: ads.stats10k.showUp + youtube.stats10k.showUp,
      didntShowUp: ads.stats10k.didntShowUp + youtube.stats10k.didntShowUp,
      showUpRate: ((ads.stats10k.showUp + youtube.stats10k.showUp) / 
        (ads.stats10k.scheduled + youtube.stats10k.scheduled) * 100 || 0).toFixed(1),
      pitched: ads.stats10k.pitched + youtube.stats10k.pitched,
      paid: ads.stats10k.paid + youtube.stats10k.paid,
      closingRate: ((ads.stats10k.paid + youtube.stats10k.paid) / 
        (ads.stats10k.pitched + youtube.stats10k.pitched) * 100 || 0).toFixed(1),
      revenue: ads.stats10k.revenue + youtube.stats10k.revenue
    },
    stats20k: {
      scheduled: ads.stats20k.scheduled + youtube.stats20k.scheduled,
      showUp: ads.stats20k.showUp + youtube.stats20k.showUp,
      didntShowUp: ads.stats20k.didntShowUp + youtube.stats20k.didntShowUp,
      showUpRate: ((ads.stats20k.showUp + youtube.stats20k.showUp) / 
        (ads.stats20k.scheduled + youtube.stats20k.scheduled) * 100 || 0).toFixed(1),
      pitched: ads.stats20k.pitched + youtube.stats20k.pitched,
      paid: ads.stats20k.paid + youtube.stats20k.paid,
      closingRate: ((ads.stats20k.paid + youtube.stats20k.paid) / 
        (ads.stats20k.pitched + youtube.stats20k.pitched) * 100 || 0).toFixed(1),
      revenue: ads.stats20k.revenue + youtube.stats20k.revenue
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">Lead Source Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr>
              <th rowSpan="2" className="border bg-gray-50 px-4 py-2 w-40 text-left">Lead Source</th>
              <th colSpan="8" className="border bg-cyan-50 text-center py-2">10K Performance</th>
              <th colSpan="8" className="border bg-teal-50 text-center py-2">20K Performance</th>
            </tr>
            <tr>
              {/* 10K Headers */}
              <th className="border bg-cyan-50 px-4 py-2 text-sm font-medium">Sched.</th>
              <th className="border bg-cyan-50 px-4 py-2 text-sm font-medium">Show</th>
              <th className="border bg-cyan-50 px-4 py-2 text-sm font-medium">No Show</th>
              <th className="border bg-cyan-50 px-4 py-2 text-sm font-medium">Show%</th>
              <th className="border bg-cyan-100 px-4 py-2 text-sm font-medium">Pitched</th>
              <th className="border bg-green-100 px-4 py-2 text-sm font-medium">Paid</th>
              <th className="border bg-blue-50 px-4 py-2 text-sm font-medium">Close%</th>
              <th className="border bg-green-50 px-4 py-2 text-sm font-medium">Revenue</th>
              
              {/* 20K Headers */}
              <th className="border bg-teal-50 px-4 py-2 text-sm font-medium">Sched.</th>
              <th className="border bg-teal-50 px-4 py-2 text-sm font-medium">Show</th>
              <th className="border bg-teal-50 px-4 py-2 text-sm font-medium">No Show</th>
              <th className="border bg-teal-50 px-4 py-2 text-sm font-medium">Show%</th>
              <th className="border bg-teal-100 px-4 py-2 text-sm font-medium">Pitched</th>
              <th className="border bg-green-100 px-4 py-2 text-sm font-medium">Paid</th>
              <th className="border bg-blue-50 px-4 py-2 text-sm font-medium">Close%</th>
              <th className="border bg-green-50 px-4 py-2 text-sm font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { name: 'Meta Ads', stats: ads },
              { name: 'YouTube', stats: youtube },
              { name: 'Total', stats: totals, isTotal: true }
            ].map(({ name, stats, isTotal }) => (
              <tr 
                key={name}
                className={`${isTotal ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
              >
                <td className="border px-4 py-2">{name}</td>
                
                {/* 10K Stats */}
                <td className="border px-4 py-2 text-center bg-cyan-50/50">{stats.stats10k.scheduled}</td>
                <td className="border px-4 py-2 text-center bg-cyan-50/50">{stats.stats10k.showUp}</td>
                <td className="border px-4 py-2 text-center bg-cyan-50/50">{stats.stats10k.didntShowUp}</td>
                <td className="border px-4 py-2 text-center bg-cyan-50/50">{stats.stats10k.showUpRate}%</td>
                <td className="border px-4 py-2 text-center bg-cyan-100/50">{stats.stats10k.pitched}</td>
                <td className="border px-4 py-2 text-center bg-green-100/50">{stats.stats10k.paid}</td>
                <td className="border px-4 py-2 text-center bg-blue-50/50">{stats.stats10k.closingRate}%</td>
                <td className="border px-4 py-2 text-center bg-green-50/50">₹{stats.stats10k.revenue.toLocaleString()}</td>
                
                {/* 20K Stats */}
                <td className="border px-4 py-2 text-center bg-teal-50/50">{stats.stats20k.scheduled}</td>
                <td className="border px-4 py-2 text-center bg-teal-50/50">{stats.stats20k.showUp}</td>
                <td className="border px-4 py-2 text-center bg-teal-50/50">{stats.stats20k.didntShowUp}</td>
                <td className="border px-4 py-2 text-center bg-teal-50/50">{stats.stats20k.showUpRate}%</td>
                <td className="border px-4 py-2 text-center bg-teal-100/50">{stats.stats20k.pitched}</td>
                <td className="border px-4 py-2 text-center bg-green-100/50">{stats.stats20k.paid}</td>
                <td className="border px-4 py-2 text-center bg-blue-50/50">{stats.stats20k.closingRate}%</td>
                <td className="border px-4 py-2 text-center bg-green-50/50">₹{stats.stats20k.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

LeadSourcePerformance.propTypes = {
  leadSourceStats: PropTypes.shape({
    ads: PropTypes.shape({
      stats10k: PropTypes.shape({
        scheduled: PropTypes.number.isRequired,
        showUp: PropTypes.number.isRequired,
        didntShowUp: PropTypes.number.isRequired,
        showUpRate: PropTypes.string.isRequired,
        pitched: PropTypes.number.isRequired,
        paid: PropTypes.number.isRequired,
        closingRate: PropTypes.string.isRequired,
        revenue: PropTypes.number.isRequired
      }).isRequired,
      stats20k: PropTypes.shape({
        scheduled: PropTypes.number.isRequired,
        showUp: PropTypes.number.isRequired,
        didntShowUp: PropTypes.number.isRequired,
        showUpRate: PropTypes.string.isRequired,
        pitched: PropTypes.number.isRequired,
        paid: PropTypes.number.isRequired,
        closingRate: PropTypes.string.isRequired,
        revenue: PropTypes.number.isRequired
      }).isRequired
    }).isRequired,
    youtube: PropTypes.shape({
      stats10k: PropTypes.shape({
        scheduled: PropTypes.number.isRequired,
        showUp: PropTypes.number.isRequired,
        didntShowUp: PropTypes.number.isRequired,
        showUpRate: PropTypes.string.isRequired,
        pitched: PropTypes.number.isRequired,
        paid: PropTypes.number.isRequired,
        closingRate: PropTypes.string.isRequired,
        revenue: PropTypes.number.isRequired
      }).isRequired,
      stats20k: PropTypes.shape({
        scheduled: PropTypes.number.isRequired,
        showUp: PropTypes.number.isRequired,
        didntShowUp: PropTypes.number.isRequired,
        showUpRate: PropTypes.string.isRequired,
        pitched: PropTypes.number.isRequired,
        paid: PropTypes.number.isRequired,
        closingRate: PropTypes.string.isRequired,
        revenue: PropTypes.number.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default LeadSourcePerformance;
