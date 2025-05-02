import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line
} from 'recharts';
import { Users, Activity, AlertTriangle, BarChart2, PieChart as PieChartIcon, Clock, Smartphone, Grid } from 'lucide-react';

const UserAnalytics = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/login-tracking');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data.users || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user analytics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    const intervalId = setInterval(fetchUserData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const stats = useMemo(() => ({
    totalUsers: userData.length,
    onlineUsers: userData.filter(user => user.isOnline).length,
    adminUsers: userData.filter(user => user.role === 'admin').length,
    recentLogins: userData.filter(user =>
      user.lastOnline && new Date(user.lastOnline) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    averageSessionMinutes: Math.round(userData.reduce((acc, user) => {
      if (user.sessions?.length) {
        return acc + (user.sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / user.sessions.length);
      }
      return acc;
    }, 0) / (userData.length || 1) / 60),
    newUsersToday: userData.filter(user =>
      user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  }), [userData]);

  const getRoleDistribution = () => {
    const roles = {};
    userData.forEach(user => {
      const role = user.role || 'user';
      roles[role] = (roles[role] || 0) + 1;
    });
    return Object.keys(roles).map(role => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: roles[role]
    }));
  };

  const getLoginsByDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    userData.forEach(user => {
      if (user.loginHistory?.length) {
        user.loginHistory.forEach(login => {
          if (login.timestamp) dayCounts[new Date(login.timestamp).getDay()]++;
        });
      }
    });
    return days.map((day, index) => ({ name: day, logins: dayCounts[index] }));
  };

  const getLoginTimeData = () => {
    const hourCounts = Array(24).fill(0);
    userData.forEach(user => {
      if (user.loginHistory?.length) {
        user.loginHistory.forEach(login => {
          if (login.timestamp) hourCounts[new Date(login.timestamp).getHours()]++;
        });
      }
    });
    return hourCounts.map((count, hour) => ({ name: `${hour}:00`, logins: count }));
  };

  const getLoginHeatmapData = () => {
    const heatmapData = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({ day: days[day], hour: `${hour}:00`, value: 0, dayIndex: day });
      }
    }
    userData.forEach(user => {
      if (user.loginHistory?.length) {
        user.loginHistory.forEach(login => {
          if (login.timestamp) {
            const date = new Date(login.timestamp);
            const day = date.getDay();
            const hour = date.getHours();
            const index = (day * 24) + hour;
            if (index < heatmapData.length) heatmapData[index].value += 1;
          }
        });
      }
    });
    return heatmapData;
  };

  const getDeviceTypeData = () => {
    const devices = { Mobile: 0, Tablet: 0, Desktop: 0, Unknown: 0 };
    userData.forEach(user => {
      if (user.loginHistory?.length) {
        user.loginHistory.forEach(login => {
          if (login.userAgent) {
            if (login.userAgent.includes('Mobi')) devices.Mobile++;
            else if (login.userAgent.includes('Tablet')) devices.Tablet++;
            else if (login.userAgent.includes('Windows') || login.userAgent.includes('Macintosh') || login.userAgent.includes('Linux')) devices.Desktop++;
            else devices.Unknown++;
          } else {
            devices.Unknown++;
          }
        });
      }
    });
    return Object.entries(devices)
      .map(([name, value]) => ({ name, value }))
      .filter(device => device.value > 0);
  };

  const getUserGrowthData = () => {
    const monthlyUsers = {};
    userData.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyUsers[monthYear] = (monthlyUsers[monthYear] || 0) + 1;
      }
    });
    const growthData = Object.entries(monthlyUsers)
      .map(([monthYear, count]) => {
        const [year, month] = monthYear.split('-').map(Number);
        return { monthYear, count, date: new Date(year, month - 1) };
      })
      .sort((a, b) => a.date - b.date);
    let cumulative = 0;
    return growthData.map(data => {
      cumulative += data.count;
      return {
        name: new Date(data.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newUsers: data.count,
        totalUsers: cumulative
      };
    });
  };

  const getSessionDurationData = () => {
    const durations = {
      'Less than 5 min': 0,
      '5-15 min': 0,
      '15-30 min': 0,
      '30-60 min': 0,
      'Over 60 min': 0
    };
    userData.forEach(user => {
      if (user.sessions?.length) {
        user.sessions.forEach(session => {
          const durationMin = (session.duration || 0) / 60;
          if (durationMin < 5) durations['Less than 5 min']++;
          else if (durationMin < 15) durations['5-15 min']++;
          else if (durationMin < 30) durations['15-30 min']++;
          else if (durationMin < 60) durations['30-60 min']++;
          else durations['Over 60 min']++;
        });
      }
    });
    const result = Object.entries(durations).map(([name, value]) => ({ name, value }));
    console.log('Session Duration Data:', result);
    return result.filter(item => item.value > 0);
  };

  const getBrowserStats = () => {
    const browsers = {};
    userData.forEach(user => {
      if (user.loginHistory?.length) {
        user.loginHistory.forEach(login => {
          if (login.userAgent) {
            let browser = 'Unknown';
            if (login.userAgent.includes('Chrome')) browser = 'Chrome';
            else if (login.userAgent.includes('Firefox')) browser = 'Firefox';
            else if (login.userAgent.includes('Safari') && !login.userAgent.includes('Chrome')) browser = 'Safari';
            else if (login.userAgent.includes('Edge')) browser = 'Edge';
            else if (login.userAgent.includes('MSIE') || login.userAgent.includes('Trident')) browser = 'IE';
            browsers[browser] = (browsers[browser] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(browsers).map(([name, value]) => ({ name, value }));
  };

  const getFeatureUsageData = () => {
    const features = {
      'Profile Views': 0,
      'Posts Created': 0,
      'Comments': 0,
      'Likes': 0,
      'Shares': 0
    };
    userData.forEach(user => {
      if (user.activity?.features) {
        features['Profile Views'] += user.activity.features.profileViews || 0;
        features['Posts Created'] += user.activity.features.posts || 0;
        features['Comments'] += user.activity.features.comments || 0;
        features['Likes'] += user.activity.features.likes || 0;
        features['Shares'] += user.activity.features.shares || 0;
      }
    });
    return Object.entries(features)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };

  const getUserActivityScore = () => {
    const metrics = [
      { name: 'Login Frequency', key: 'logins', max: 100 },
      { name: 'Session Duration', key: 'session', max: 120 },
      { name: 'Feature Usage', key: 'features', max: 150 },
      { name: 'Social Interactions', key: 'social', max: 80 },
      { name: 'Content Creation', key: 'content', max: 60 }
    ];
    const scores = metrics.map(metric => ({ metric: metric.name, value: 0 }));
    userData.forEach(user => {
      if (user.activity) {
        scores[0].value += (user.loginHistory?.length || 0) / userData.length * 100;
        scores[1].value += (user.sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) / 60 || 0) / userData.length;
        scores[2].value += (user.activity.features ? Object.values(user.activity.features).reduce((sum, v) => sum + v, 0) : 0) / userData.length;
        scores[3].value += (user.activity.social || 0) / userData.length * 100;
        scores[4].value += (user.activity.content || 0) / userData.length * 100;
      }
    });
    return scores.map((score, index) => ({
      metric: score.metric,
      value: Math.min(Math.round(score.value), metrics[index].max)
    }));
  };

  const getEngagementTrends = () => {
    const days = Array(30).fill(0).map((_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        name: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        activeUsers: 0,
        avgSession: 0
      };
    });
    userData.forEach(user => {
      if (user.loginHistory?.length) {
        user.loginHistory.forEach(login => {
          if (login.timestamp) {
            const loginDate = new Date(login.timestamp);
            const dayIndex = Math.floor((Date.now() - loginDate.getTime()) / (24 * 60 * 60 * 1000));
            if (dayIndex >= 0 && dayIndex < 30) {
              days[29 - dayIndex].activeUsers++;
            }
          }
        });
      }
      if (user.sessions?.length) {
        user.sessions.forEach(session => {
          if (session.startTime) {
            const sessionDate = new Date(session.startTime);
            const dayIndex = Math.floor((Date.now() - sessionDate.getTime()) / (24 * 60 * 60 * 1000));
            if (dayIndex >= 0 && dayIndex < 30) {
              days[29 - dayIndex].avgSession += (session.duration || 0) / 60;
            }
          }
        });
      }
    });
    return days.map(day => ({
      ...day,
      avgSession: day.activeUsers > 0 ? Math.round(day.avgSession / day.activeUsers) : 0
    }));
  };

  // New: Retention Rate
  const getRetentionData = () => {
    const weeks = Array(4).fill(0).map((_, i) => ({
      name: `Week ${i + 1}`,
      retainedUsers: 0
    }));
    userData.forEach(user => {
      if (user.createdAt && user.loginHistory?.length) {
        const createdDate = new Date(user.createdAt);
        user.loginHistory.forEach(login => {
          if (login.timestamp) {
            const loginDate = new Date(login.timestamp);
            const weekDiff = Math.floor((loginDate - createdDate) / (7 * 24 * 60 * 60 * 1000));
            if (weekDiff >= 0 && weekDiff < 4) {
              weeks[weekDiff].retainedUsers++;
            }
          }
        });
      }
    });
    const totalNewUsers = userData.filter(user => user.createdAt).length;
    return weeks.map(week => ({
      ...week,
      retentionRate: totalNewUsers > 0 ? Math.round((week.retainedUsers / totalNewUsers) * 100) : 0
    }));
  };

  // New: Engagement by User Segment (Gender)
  const getEngagementByGender = () => {
    const genders = { Male: { logins: 0, sessions: 0 }, Female: { logins: 0, sessions: 0 }, Other: { logins: 0, sessions: 0 } };
    userData.forEach(user => {
      const gender = user.gender
        ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()
        : 'Other';
      if (!genders[gender]) {
        return; // Skip invalid genders
      }
      if (user.loginHistory?.length) {
        genders[gender].logins += user.loginHistory.length; // Line 340
      }
      if (user.sessions?.length) {
        genders[gender].sessions += user.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
      }
    });
    return Object.entries(genders).map(([gender, data]) => ({
      name: gender,
      logins: Math.round(data.logins),
      sessionMinutes: Math.round(data.sessions)
    }));
  };
  // New: Engagement by Age Group
  const getEngagementByAgeGroup = () => {
    const ageGroups = {
      'Under 18': { logins: 0, sessions: 0 },
      '18-25': { logins: 0, sessions: 0 },
      '26-35': { logins: 0, sessions: 0 },
      '36-50': { logins: 0, sessions: 0 },
      'Over 50': { logins: 0, sessions: 0 }
    };
    userData.forEach(user => {
      if (user.birthdate) {
        const age = new Date().getFullYear() - new Date(user.birthdate).getFullYear();
        let group;
        if (age < 18) group = 'Under 18';
        else if (age <= 25) group = '18-25';
        else if (age <= 35) group = '26-35';
        else if (age <= 50) group = '36-50';
        else group = 'Over 50';
        if (user.loginHistory?.length) {
          ageGroups[group].logins += user.loginHistory.length;
        }
        if (user.sessions?.length) {
          ageGroups[group].sessions += user.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
        }
      }
    });
    return Object.entries(ageGroups).map(([group, data]) => ({
      name: group,
      logins: Math.round(data.logins),
      sessionMinutes: Math.round(data.sessions)
    }));
  };

  // New: Session Quality Score
  const getSessionQualityScore = () => {
    const scores = userData.map(user => {
      let score = 0;
      if (user.sessions?.length) {
        const avgDuration = user.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / user.sessions.length / 60;
        score += Math.min(avgDuration / 60, 1) * 50; // Max 50 points for duration
      }
      if (user.activity?.features) {
        const featureCount = Object.values(user.activity.features).reduce((sum, v) => sum + v, 0);
        score += Math.min(featureCount / 100, 1) * 50; // Max 50 points for features
      }
      return { name: user.username || user.email, score: Math.round(score) };
    });
    return scores.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10 users
  };

  const filteredUsers = userData.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'online') return user.isOnline;
    if (filter === 'admin') return user.role === 'admin';
    if (filter === 'recent') return user.lastOnline && new Date(user.lastOnline) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    return true;
  });

  const formatDate = dateString => !dateString ? 'Never' : new Date(dateString).toLocaleString();

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#facc15', '#f97316'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">User Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitoring {stats.totalUsers} users in real-time</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {['week', 'month', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { tab: 'overview', icon: Users, label: 'Overview' },
              { tab: 'activity', icon: BarChart2, label: 'Activity' },
              { tab: 'engagement', icon: Activity, label: 'Engagement' },
              { tab: 'devices', icon: Smartphone, label: 'Devices' },
              { tab: 'users', icon: PieChartIcon, label: 'Users' }
            ].map(({ tab, icon: Icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: 'Total Users', value: stats.totalUsers, sub: `+${stats.newUsersToday} today`, color: 'blue' },
            { icon: Activity, label: 'Online Users', value: stats.onlineUsers, sub: `${stats.totalUsers > 0 ? Math.round((stats.onlineUsers / stats.totalUsers) * 100) : 0}% of total`, color: 'green' },
            { icon: Clock, label: 'Avg. Session', value: `${stats.averageSessionMinutes} min`, sub: 'Per user session', color: 'purple' },
            { icon: Clock, label: 'Recent Logins (24h)', value: stats.recentLogins, sub: `${stats.totalUsers > 0 ? Math.round((stats.recentLogins / stats.totalUsers) * 100) : 0}% of total`, color: 'yellow' }
          ].map(({ icon: Icon, label, value, sub, color }, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-100">
              <div className="flex items-center">
                <Icon className={`h-10 w-10 text-${color}-500 mr-4`} />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Role Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getRoleDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {getRoleDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getUserGrowthData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} users`, 'Total Users']} />
                    <Area type="monotone" dataKey="totalUsers" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Grid className="h-5 w-5 text-orange-500 mr-2" />
                Login Activity Heatmap
              </h2>
              <p className="text-gray-600 mb-4">Login distribution by day and hour</p>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="grid grid-cols-25 gap-1">
                    <div className="h-10" />
                    {Array(24).fill(0).map((_, hour) => (
                      <div key={hour} className="h-10 flex items-center justify-center text-xs text-gray-600 font-medium">
                        {hour}:00
                      </div>
                    ))}
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => (
                      <React.Fragment key={day}>
                        <div className="h-10 flex items-center text-xs text-gray-600 font-medium">{day}</div>
                        {Array(24).fill(0).map((_, hour) => {
                          const data = getLoginHeatmapData().find(d => d.day === day && d.hour === `${hour}:00`);
                          const value = data ? data.value : 0;
                          const maxValue = Math.max(...getLoginHeatmapData().map(d => d.value));
                          const opacity = maxValue > 0 ? 0.1 + (value / maxValue) * 0.9 : 0.1;
                          return (
                            <div
                              key={hour}
                              className="h-10 rounded-lg transition-colors"
                              style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
                              title={`${day} ${hour}:00 - ${value} logins`}
                            />
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <span className="text-xs text-gray-600 mr-2">Fewer</span>
                <div className="flex">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, i) => (
                    <div key={i} className="w-6 h-4 rounded" style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }} />
                  ))}
                </div>
                <span className="text-xs text-gray-600 ml-2">More</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Login Activity by Hour</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getLoginTimeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} logins`, 'Count']} />
                      <Bar dataKey="logins" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Login Activity by Day</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getLoginsByDayOfWeek()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} logins`, 'Count']} />
                      <Bar dataKey="logins" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth (New Registrations)</h2>
              <p className="text-gray-600 mb-4">New user registrations and cumulative growth over time</p>
              {getUserGrowthData().length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No user registration data available.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getUserGrowthData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="newUsers" name="New Users" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      <Area yAxisId="right" type="monotone" dataKey="totalUsers" name="Total Users" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Session Duration</h2>
              <p className="text-gray-600 mb-4">Distribution of session lengths across all users</p>
              {getSessionDurationData().length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No session data available. Ensure users have recorded sessions.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSessionDurationData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {getSessionDurationData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} sessions`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Usage Breakdown</h2>
                <p className="text-gray-600 mb-4">User interactions with key app features</p>
                {getFeatureUsageData().length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No feature usage data available.
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getFeatureUsageData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} actions`, 'Count']} />
                        <Bar dataKey="value" fill="#6366f1">
                          {getFeatureUsageData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Activity Score</h2>
                <p className="text-gray-600 mb-4">Composite score of user engagement metrics</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={100} data={getUserActivityScore()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} />
                      <Radar name="Activity Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                      <Tooltip formatter={(value) => [`${value}`, 'Score']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Retention Rate (First 4 Weeks)</h2>
              <p className="text-gray-600 mb-4">Percentage of users returning each week after registration</p>
              {getRetentionData().every(item => item.retentionRate === 0) ? (
                <div className="text-center text-gray-500 py-8">
                  No retention data available.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getRetentionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Retention Rate']} />
                      <Bar dataKey="retentionRate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement by Gender</h2>
                <p className="text-gray-600 mb-4">Login and session activity by gender</p>
                {getEngagementByGender().every(item => item.logins === 0 && item.sessionMinutes === 0) ? (
                  <div className="text-center text-gray-500 py-8">
                    No gender-based engagement data available.
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getEngagementByGender()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" unit="min" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="logins" name="Logins" fill="#6366f1" />
                        <Bar yAxisId="right" dataKey="sessionMinutes" name="Session Minutes" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement by Age Group</h2>
                <p className="text-gray-600 mb-4">Login and session activity by age group</p>
                {getEngagementByAgeGroup().every(item => item.logins === 0 && item.sessionMinutes === 0) ? (
                  <div className="text-center text-gray-500 py-8">
                    No age-based engagement data available.
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getEngagementByAgeGroup()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" unit="min" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="logins" name="Logins" fill="#6366f1" />
                        <Bar yAxisId="right" dataKey="sessionMinutes" name="Session Minutes" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Users by Session Quality</h2>
              <p className="text-gray-600 mb-4">Top 10 users by combined session duration and feature usage</p>
              {getSessionQualityScore().length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No session quality data available.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSessionQualityScore()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}`, 'Quality Score']} />
                      <Bar dataKey="score" fill="#6366f1">
                        {getSessionQualityScore().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Trends (Last 30 Days)</h2>
              <p className="text-gray-600 mb-4">Daily active users and average session duration</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getEngagementTrends()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" unit="min" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#6366f1" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="avgSession" name="Avg Session (min)" stroke="#10b981" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Smartphone className="h-5 w-5 text-purple-500 mr-2" />
                  Device Type Distribution
                </h2>
                <p className="text-gray-600 mb-4">Devices used for user logins</p>
                {getDeviceTypeData().length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No device data available.
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getDeviceTypeData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {getDeviceTypeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} logins`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Smartphone className="h-5 w-5 text-blue-500 mr-2" />
                  Browser Distribution
                </h2>
                <p className="text-gray-600 mb-4">Browsers used for user logins</p>
                {getBrowserStats().length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No browser data available.
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getBrowserStats()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {getBrowserStats().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} logins`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User List</h2>
              <div className="mt-4 sm:mt-0 flex gap-2">
                {[
                  { filter: 'all', label: 'All Users' },
                  { filter: 'online', label: 'Online Now' },
                  { filter: 'admin', label: 'Admins' },
                  { filter: 'recent', label: 'Recent (24h)' }
                ].map(({ filter: f, label }) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {['Name / Email', 'Role', 'Status', 'Last Login', 'Sessions'].map(header => (
                      <th key={header} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No users match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold text-lg">
                                {user.username ? user.username.charAt(0) : user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.username || 'Unnamed User'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm text-gray-500">{user.isOnline ? 'Online' : 'Offline'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.lastOnline)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.sessions?.length || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Showing {filteredUsers.length} of {userData.length} users</div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-lg text-sm text-gray-700 bg-white disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border rounded-lg text-sm text-gray-700 bg-white disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalytics;