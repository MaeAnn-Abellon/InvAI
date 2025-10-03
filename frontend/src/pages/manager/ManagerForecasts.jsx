import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../services/inventoryApi';

// Modern styling to match dashboard
const modernStyles = {
  page: {
    padding: '2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: '100vh'
  },
  header: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '1.5rem 2rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '.5rem'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '.9rem'
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '1rem'
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    fontSize: '.85rem',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontWeight: 600,
    color: '#374151',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '.75rem 1rem',
    borderBottom: '1px solid #f3f4f6'
  },
  backButton: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: '#fff',
    border: 'none',
    padding: '.75rem 1.25rem',
    borderRadius: '12px',
    fontSize: '.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(107, 114, 128, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem'
  }
};

const ManagerForecasts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [windowDays, setWindowDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryApi.forecastDepletion({ windowDays });
        const list = data.forecasts || [];
        setForecasts(list);
        
        // Enhanced suggestion heuristic
        const sug = list
          .filter(it => (it.daysToDeplete !== null && it.daysToDeplete <= 14) || it.status === 'out_of_stock')
          .slice(0, 10)
          .map(it => ({
            item: it.name,
            priority: it.status === 'out_of_stock' ? 'critical' : it.daysToDeplete <= 7 ? 'high' : 'medium',
            reason: it.status === 'out_of_stock' 
              ? 'Already out of stock - Immediate restock required' 
              : `Projected depletion in ${Math.round(it.daysToDeplete)} days`,
            daysLeft: it.daysToDeplete
          }));
        setSuggestions(sug);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [windowDays]);

  if (loading) {
    return (
      <div style={modernStyles.page}>
        <div style={modernStyles.card}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            padding: '3rem'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #4f46e5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '1.1rem', color: '#64748b' }}>
              Loading AI forecasts...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={modernStyles.page}>
      {/* Header */}
      <div style={modernStyles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h1 style={modernStyles.title}>🤖 AI Depletion Forecasts</h1>
            <p style={modernStyles.subtitle}>
              Intelligent predictions for inventory management and restocking
            </p>
          </div>
          <button 
            onClick={() => navigate('/manager/dashboard')}
            style={modernStyles.backButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.4)';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div style={modernStyles.controls}>
          <label style={{ fontSize: '.85rem', fontWeight: 500, color: '#374151' }}>
            Forecast Window:
            <select 
              value={windowDays} 
              onChange={e => setWindowDays(parseInt(e.target.value, 10))}
              style={{
                marginLeft: '.5rem',
                padding: '.5rem .75rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '.85rem',
                background: '#fff'
              }}
            >
              {[14, 30, 60, 90].map(d => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </label>
          {error && (
            <span style={{
              color: '#ef4444',
              fontSize: '.85rem',
              background: '#fef2f2',
              padding: '.5rem .75rem',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              ⚠️ Error: {error}
            </span>
          )}
          <small style={{ 
            color: '#9ca3af',
            background: '#f9fafb',
            padding: '.4rem .6rem',
            borderRadius: '6px',
            fontSize: '.75rem'
          }}>
            AI predictions based on usage patterns
          </small>
        </div>
      </div>

      {/* Forecast Table */}
      <div style={modernStyles.card}>
        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
          📊 Projected Depletion Analysis
        </h3>
        <table style={modernStyles.table}>
          <thead>
            <tr>
              <th style={modernStyles.th}>Item Name</th>
              <th style={modernStyles.th}>Current Qty</th>
              <th style={modernStyles.th}>Daily Usage</th>
              <th style={modernStyles.th}>Days Remaining</th>
              <th style={modernStyles.th}>Depletion Date</th>
              <th style={modernStyles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map(item => (
              <tr key={item.id} style={{ transition: 'background-color 0.2s' }}>
                <td style={modernStyles.td}>
                  <strong style={{ color: '#1e293b' }}>{item.name}</strong>
                </td>
                <td style={modernStyles.td}>{item.quantity}</td>
                <td style={modernStyles.td}>
                  {item.avgDailyUsage ? item.avgDailyUsage.toFixed(2) : '—'}
                </td>
                <td style={modernStyles.td}>
                  {item.daysToDeplete ? (
                    <span style={{
                      color: item.daysToDeplete <= 7 ? '#ef4444' : item.daysToDeplete <= 14 ? '#f59e0b' : '#10b981',
                      fontWeight: 600
                    }}>
                      {Math.round(item.daysToDeplete)}
                    </span>
                  ) : '—'}
                </td>
                <td style={modernStyles.td}>
                  {item.projectedDepletionDate 
                    ? new Date(item.projectedDepletionDate).toLocaleDateString() 
                    : '—'
                  }
                </td>
                <td style={modernStyles.td}>
                  <StatusBadge status={item.status} daysLeft={item.daysToDeplete} />
                </td>
              </tr>
            ))}
            {!forecasts.length && (
              <tr>
                <td colSpan={6} style={{
                  ...modernStyles.td,
                  textAlign: 'center',
                  color: '#64748b',
                  padding: '2rem',
                  fontStyle: 'italic'
                }}>
                  No usage data available for the selected time window
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Suggestions */}
      <div style={modernStyles.card}>
        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
          💡 Restocking Recommendations
        </h3>
        {suggestions.length > 0 ? (
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {suggestions.map((suggestion, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: suggestion.priority === 'critical' ? '#fef2f2' : 
                           suggestion.priority === 'high' ? '#fef9c3' : '#f0fdf4',
                borderLeft: `4px solid ${
                  suggestion.priority === 'critical' ? '#ef4444' :
                  suggestion.priority === 'high' ? '#f59e0b' : '#10b981'
                }`,
                borderRadius: '8px'
              }}>
                <div>
                  <strong style={{ 
                    color: '#1e293b',
                    fontSize: '.9rem'
                  }}>
                    {suggestion.item}
                  </strong>
                  <p style={{ 
                    margin: '.25rem 0 0',
                    fontSize: '.8rem',
                    color: '#64748b'
                  }}>
                    {suggestion.reason}
                  </p>
                </div>
                <PriorityBadge priority={suggestion.priority} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#10b981',
            background: '#f0fdf4',
            borderRadius: '12px',
            border: '1px dashed #bbf7d0'
          }}>
            🎉 No urgent restocking needed for the next 2 weeks
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
function StatusBadge({ status, daysLeft }) {
  if (status === 'out_of_stock') {
    return (
      <span style={{
        background: '#fef2f2',
        color: '#ef4444',
        padding: '.25rem .5rem',
        fontSize: '.75rem',
        fontWeight: 600,
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '.3px'
      }}>
        Out of Stock
      </span>
    );
  }
  
  if (daysLeft <= 7) {
    return (
      <span style={{
        background: '#fef2f2',
        color: '#ef4444',
        padding: '.25rem .5rem',
        fontSize: '.75rem',
        fontWeight: 600,
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '.3px'
      }}>
        Critical
      </span>
    );
  }
  
  if (daysLeft <= 14) {
    return (
      <span style={{
        background: '#fef9c3',
        color: '#f59e0b',
        padding: '.25rem .5rem',
        fontSize: '.75rem',
        fontWeight: 600,
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '.3px'
      }}>
        Warning
      </span>
    );
  }
  
  return (
    <span style={{
      background: '#f0fdf4',
      color: '#10b981',
      padding: '.25rem .5rem',
      fontSize: '.75rem',
      fontWeight: 600,
      borderRadius: '12px',
      textTransform: 'uppercase',
      letterSpacing: '.3px'
    }}>
      Healthy
    </span>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    critical: { bg: '#fef2f2', color: '#ef4444', text: 'Critical' },
    high: { bg: '#fef9c3', color: '#f59e0b', text: 'High' },
    medium: { bg: '#f0fdf4', color: '#10b981', text: 'Medium' }
  };
  
  const style = colors[priority] || colors.medium;
  
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '.3rem .6rem',
      fontSize: '.75rem',
      fontWeight: 600,
      borderRadius: '12px',
      textTransform: 'uppercase',
      letterSpacing: '.3px'
    }}>
      {style.text}
    </span>
  );
}

export default ManagerForecasts;