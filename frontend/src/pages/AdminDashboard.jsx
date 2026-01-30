import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Building, GraduationCap, TrendingUp, Download, 
  Search, ChevronLeft, ChevronRight, Trash2, RefreshCw,
  Trophy, Calendar, Filter
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Departments and years for filters
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [page, search, department, year]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load stats');
    }
  };

  const fetchFilters = async () => {
    try {
      const [deptRes, yearRes] = await Promise.all([
        axios.get(`${API_URL}/api/departments`),
        axios.get(`${API_URL}/api/years`)
      ]);
      setDepartments(deptRes.data);
      setYears(yearRes.data);
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  };

  const fetchParticipants = async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...(search && { search }),
        ...(department && { department }),
        ...(year && { year })
      });
      
      const response = await axios.get(`${API_URL}/api/admin/participants?${params}`);
      setParticipants(response.data.participants);
      setTotal(response.data.total);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load participants');
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      await axios.delete(`${API_URL}/api/admin/participants/${id}`);
      fetchParticipants();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete participant');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/export`);
      const data = response.data.data;
      
      // Convert to CSV
      const headers = ['Name', 'Register Number', 'Email', 'Phone', 'Department', 'Year', 'Referral Code', 'Referrals', 'Registered At'];
      const csvContent = [
        headers.join(','),
        ...data.map(p => [
          `"${p.name}"`,
          p.register_number,
          p.email,
          p.phone_number,
          `"${p.department}"`,
          `"${p.year_of_study}"`,
          p.referral_code,
          p.referral_count,
          p.created_at
        ].join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `persofest26_participants_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchParticipants();
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setYear('');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card-brutal p-8 animate-pulse">
          <h2 className="font-heading text-xl">Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card-brutal p-8 bg-primary">
          <h2 className="font-heading text-xl mb-2">Access Denied</h2>
          <p className="font-body">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 page-transition">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-4xl mb-2" data-testid="admin-dashboard-title">Admin Dashboard</h1>
            <p className="font-body text-xs md:text-sm text-gray-600">Manage PERSOFEST'26 registrations</p>
          </div>
          <button
            onClick={handleExport}
            className="btn-brutal bg-accent flex items-center gap-2 px-4 py-2"
            data-testid="export-button"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {/* Total Participants */}
          <div className="card-brutal p-4 md:p-6 bg-primary transition-all hover:shadow-brutal-lg" data-testid="stat-total">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} strokeWidth={2.5} />
              <span className="font-heading text-[10px] md:text-xs uppercase tracking-widest">Total</span>
            </div>
            <p className="font-heading text-3xl md:text-5xl">{stats?.total_participants || 0}</p>
          </div>

          {/* Recent */}
          <div className="card-brutal p-4 md:p-6 bg-accent transition-all hover:shadow-brutal-lg" data-testid="stat-recent">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} strokeWidth={2.5} />
              <span className="font-heading text-[10px] md:text-xs uppercase tracking-widest">This Week</span>
            </div>
            <p className="font-heading text-3xl md:text-5xl">{stats?.recent_registrations || 0}</p>
          </div>

          {/* Total Referrals */}
          <div className="card-brutal p-4 md:p-6 bg-secondary text-white transition-all hover:shadow-brutal-lg" data-testid="stat-referrals">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} strokeWidth={2.5} />
              <span className="font-heading text-[10px] md:text-xs uppercase tracking-widest">Referrals</span>
            </div>
            <p className="font-heading text-3xl md:text-5xl">{stats?.total_referrals || 0}</p>
          </div>

          {/* Departments */}
          <div className="card-brutal p-4 md:p-6 transition-all hover:shadow-brutal-lg" data-testid="stat-departments">
            <div className="flex items-center gap-2 mb-2">
              <Building size={20} strokeWidth={2.5} />
              <span className="font-heading text-[10px] md:text-xs uppercase tracking-widest">Depts</span>
            </div>
            <p className="font-heading text-3xl md:text-5xl">{Object.keys(stats?.by_department || {}).length}</p>
          </div>
        </div>

        {/* Department & Year Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
          {/* By Department */}
          <div className="card-brutal p-4 md:p-6" data-testid="dept-breakdown">
            <div className="flex items-center gap-2 mb-4">
              <Building size={18} strokeWidth={2.5} />
              <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest">By Department</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(stats?.by_department || {}).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between p-2 bg-muted border-2 border-black">
                  <span className="font-body text-xs truncate flex-1 mr-2">{dept}</span>
                  <span className="font-heading text-sm bg-accent px-2 py-1 border-2 border-black">{count}</span>
                </div>
              ))}
              {Object.keys(stats?.by_department || {}).length === 0 && (
                <p className="font-body text-xs text-gray-500">No data yet</p>
              )}
            </div>
          </div>

          {/* By Year */}
          <div className="card-brutal p-4 md:p-6" data-testid="year-breakdown">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={18} strokeWidth={2.5} />
              <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest">By Year</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(stats?.by_year || {}).map(([yr, count]) => (
                <div key={yr} className="flex items-center justify-between p-3 border-2 border-black">
                  <span className="font-body text-sm">{yr}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-3 bg-secondary border-2 border-black" style={{ width: `${Math.min(count * 10, 150)}px` }} />
                    <span className="font-heading text-lg">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(stats?.by_year || {}).length === 0 && (
                <p className="font-body text-xs text-gray-500">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="card-brutal p-4 md:p-6" data-testid="participants-table-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} strokeWidth={2.5} />
              <h3 className="font-heading text-xs md:text-sm uppercase tracking-widest">All Participants</h3>
              <span className="font-body text-xs bg-muted px-2 py-1 border-2 border-black">{total}</span>
            </div>
            
            <button
              onClick={() => { fetchParticipants(); fetchStats(); }}
              className="btn-brutal-outline text-xs flex items-center gap-2 px-3 py-2"
              data-testid="refresh-button"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, register no, email..."
                className="input-brutal h-10 pl-10 text-xs w-full"
                data-testid="search-input"
              />
            </div>
            
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              className="input-brutal h-10 text-xs w-full md:w-48"
              data-testid="department-filter"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              className="input-brutal h-10 text-xs w-full md:w-36"
              data-testid="year-filter"
            >
              <option value="">All Years</option>
              {years.map(y => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>

            {(search || department || year) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-brutal-ghost text-xs px-3 py-2"
                data-testid="clear-filters"
              >
                Clear
              </button>
            )}
          </form>

          {/* Table */}
          <div className="overflow-x-auto border-2 border-black">
            <table className="w-full" data-testid="participants-table">
              <thead>
                <tr className="bg-black text-white">
                  <th className="font-heading text-[10px] md:text-xs uppercase tracking-wider p-2 md:p-3 text-left">Name</th>
                  <th className="font-heading text-[10px] md:text-xs uppercase tracking-wider p-2 md:p-3 text-left hidden md:table-cell">Reg No</th>
                  <th className="font-heading text-[10px] md:text-xs uppercase tracking-wider p-2 md:p-3 text-left hidden lg:table-cell">Department</th>
                  <th className="font-heading text-[10px] md:text-xs uppercase tracking-wider p-2 md:p-3 text-left hidden lg:table-cell">Year</th>
                  <th className="font-heading text-[10px] md:text-xs uppercase tracking-wider p-2 md:p-3 text-center">Referrals</th>
                  <th className="font-heading text-[10px] md:text-xs uppercase tracking-wider p-2 md:p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <span className="font-body text-sm">Loading...</span>
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <span className="font-body text-sm text-gray-500">No participants found</span>
                    </td>
                  </tr>
                ) : (
                  participants.map((p, idx) => (
                    <tr 
                      key={p.id} 
                      className={`border-t-2 border-black ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'} hover:bg-accent/20 transition-colors`}
                      data-testid={`participant-row-${p.id}`}
                    >
                      <td className="p-2 md:p-3">
                        <div>
                          <p className="font-body text-xs md:text-sm font-bold">{p.name}</p>
                          <p className="font-body text-[10px] text-gray-600 md:hidden">{p.register_number}</p>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 hidden md:table-cell">
                        <span className="font-body text-xs">{p.register_number}</span>
                      </td>
                      <td className="p-2 md:p-3 hidden lg:table-cell">
                        <span className="font-body text-xs truncate block max-w-[150px]" title={p.department}>
                          {p.department?.split(' ').slice(0, 2).join(' ')}...
                        </span>
                      </td>
                      <td className="p-2 md:p-3 hidden lg:table-cell">
                        <span className="font-body text-xs">{p.year_of_study}</span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <span className={`font-heading text-sm ${p.referral_count > 0 ? 'text-secondary' : ''}`}>
                          {p.referral_count}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 border-2 border-black bg-white hover:bg-primary transition-colors"
                          title="Delete"
                          data-testid={`delete-btn-${p.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="font-body text-xs text-gray-600">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-brutal-outline text-xs p-2 disabled:opacity-50"
                  data-testid="prev-page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-brutal-outline text-xs p-2 disabled:opacity-50"
                  data-testid="next-page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
