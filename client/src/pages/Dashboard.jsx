import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import { 
  Briefcase, 
  Award, 
  Calendar, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Play, 
  Sparkles,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const Dashboard = ({ setCurrentPage }) => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStatusIndex, setActiveStatusIndex] = useState(-1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading analytics dashboard...</p>
      </div>
    );
  }

  const { cards, charts, readiness } = stats || {
    cards: { totalApps: 0, upcomingOAs: 0, interviewsScheduled: 0, offersReceived: 0, highestPackage: 0, avgPackage: 0, successRate: 0 },
    charts: { funnel: [], monthly: [], statusDistribution: [] },
    readiness: { score: 0, breakdown: { dsa: { score: 0 }, projects: { score: 0 }, resume: { score: 0 }, applications: { score: 0 }, mocks: { score: 0 } } }
  };

  const chartColors = ['#6366f1', '#a855f7', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '0 40px 40px 40px' }}>
      
      {/* Top Banner Info */}
      <div className="glass-panel" style={{
        padding: '24px 30px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Insights</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700' }}>
            Dream Target: {user?.dreamCompany || 'Google'} ({user?.dreamRole || 'SDE'})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Complete your daily DSA log and upload your latest resume to update your readiness factor.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setCurrentPage('resumes')}
            className="glass-button-secondary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            Resume Portfolio
          </button>
          <button
            onClick={() => setCurrentPage('tracker')}
            className="glass-button-secondary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            Application Tracker
          </button>
          <button 
            onClick={() => setCurrentPage('roadmaps')}
            className="glass-button" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.85rem' }}
          >
            Generate Prep Roadmap <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <StatsCard title="Total Applications" value={cards.totalApps} icon={Briefcase} color="var(--color-primary)" />
        <StatsCard title="Upcoming OA Tests" value={cards.upcomingOAs} icon={Award} color="var(--color-warning)" />
        <StatsCard title="Interviews Scheduled" value={cards.interviewsScheduled} icon={Calendar} color="var(--color-info)" />
        <StatsCard title="Offers Received" value={cards.offersReceived} icon={Heart} color="var(--color-success)" />
        <StatsCard title="Highest Package" value={`${cards.highestPackage} LPA`} icon={DollarSign} color="var(--color-success)" />
        <StatsCard title="Average Package" value={`${cards.avgPackage} LPA`} icon={TrendingUp} color="var(--color-primary)" />
        <StatsCard title="Funnel Success Rate" value={`${cards.successRate}%`} icon={Percent} color="var(--color-warning)" />
      </div>

      {/* Center Section: Readiness Score & Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Placement Readiness Card */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700' }}>Placement Readiness Score</h4>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '140px' }}>
            {/* SVG Progress Circle */}
            <svg style={{ transform: 'rotate(-90deg)', width: '130px', height: '130px' }}>
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
              <circle 
                cx="65" cy="65" r="54" 
                fill="none" 
                stroke="url(#readinessGradient)" 
                strokeWidth="10" 
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - readiness.score / 100)}
                style={{ strokeLinecap: 'round', transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
              <defs>
                <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', lineHeight: '1' }}>{readiness.score}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Ready</span>
            </div>
          </div>

          {/* Breakdown sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'DSA Progress (30%)', current: readiness.breakdown.dsa.current, target: readiness.breakdown.dsa.target, unit: 'solved', score: readiness.breakdown.dsa.score, max: 30 },
              { label: 'Projects Completed (25%)', current: readiness.breakdown.projects.current, target: readiness.breakdown.projects.target, unit: 'projects', score: readiness.breakdown.projects.score, max: 25 },
              { label: 'Resume Score (20%)', current: readiness.breakdown.resume.current, target: readiness.breakdown.resume.target, unit: 'points', score: readiness.breakdown.resume.score, max: 20 },
              { label: 'Applications volume (15%)', current: readiness.breakdown.applications.current, target: readiness.breakdown.applications.target, unit: 'apps', score: readiness.breakdown.applications.score, max: 15 },
              { label: 'Mock Interviews (10%)', current: readiness.breakdown.mocks.current, target: readiness.breakdown.mocks.target, unit: 'mocks', score: readiness.breakdown.mocks.score, max: 10 }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '500' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span>{item.current}/{item.target} {item.unit} ({item.score} / {item.max} pts)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min((item.current / item.target) * 100, 100)}%`, 
                    height: '100%', 
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage('profile')}
            style={{
              background: 'none',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '10px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            Update Logs in Profile Settings
          </button>
        </div>

        {/* Monthly Applications Chart */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700' }}>Monthly Applications volume</h4>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthly} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorMonthly)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Application Funnel Chart */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700' }}>Application Funnel Stage Counts</h4>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.funnel} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="stage" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                  {charts.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution (Pie Chart) */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700' }}>Status Distribution</h4>
          <div style={{ width: '100%', minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
            {charts.statusDistribution.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No application data available</p>
            ) : (
              <>
                <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={98}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        onMouseEnter={(_, index) => setActiveStatusIndex(index)}
                        onMouseLeave={() => setActiveStatusIndex(-1)}
                      >
                        {charts.statusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                            style={{
                              transition: 'transform 0.3s ease',
                              transform: index === activeStatusIndex ? 'scale(1.08)' : 'scale(1)',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.45)'
                        }}
                        itemStyle={{ color: '#FFFFFF', fontSize: '0.95rem' }}
                        labelStyle={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}
                        formatter={(value, name) => [`${value}`, `${name}`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px', width: '100%', maxWidth: '420px' }}>
                  {charts.statusDistribution.map((entry, index) => (
                    <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '130px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: chartColors[index % chartColors.length] }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 600 }}>{entry.name}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{entry.value} applications</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
