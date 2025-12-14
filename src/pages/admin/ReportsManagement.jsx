import { useState } from 'react';
import { FileText, Download, Calendar, Users, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

export default function ReportsManagement() {
    const { authFetch } = useAuth();
    const [reportType, setReportType] = useState('users');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const reportTypes = [
        { id: 'users', label: 'Kullanıcı Raporu', icon: Users },
        { id: 'revenue', label: 'Gelir Raporu', icon: DollarSign },
        { id: 'content', label: 'İçerik Raporu', icon: BarChart3 }
    ];

    const generateReport = async () => {
        setIsLoading(true);
        try {
            const response = await authFetch(`/api/admin/reports/${reportType}?start=${dateRange.start}&end=${dateRange.end}`);
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            } else {
                // Mock data for demo
                setReportData(getMockReport(reportType));
            }
        } catch (error) {
            console.error('Report error:', error);
            setReportData(getMockReport(reportType));
        } finally {
            setIsLoading(false);
        }
    };

    const getMockReport = (type) => {
        const reports = {
            users: {
                title: 'Kullanıcı Raporu',
                summary: { total: 1247, newThisMonth: 89, active: 923, goldMembers: 45 },
                data: [
                    { period: '2024-11', newUsers: 89, activeUsers: 923 },
                    { period: '2024-10', newUsers: 76, activeUsers: 890 },
                    { period: '2024-09', newUsers: 102, activeUsers: 845 }
                ]
            },
            revenue: {
                title: 'Gelir Raporu',
                summary: { total: 12499.92, thisMonth: 1899.88, avgPerUser: 277.78, subscriptions: 45 },
                data: [
                    { period: '2024-11', revenue: 1899.88, subscriptions: 8 },
                    { period: '2024-10', revenue: 2149.93, subscriptions: 12 },
                    { period: '2024-09', revenue: 1649.95, subscriptions: 9 }
                ]
            },
            content: {
                title: 'İçerik Raporu',
                summary: { ratings: 3456, reviews: 892, playlists: 234, avgRating: 4.2 },
                data: [
                    { period: '2024-11', ratings: 456, reviews: 123, playlists: 34 },
                    { period: '2024-10', ratings: 389, reviews: 98, playlists: 28 },
                    { period: '2024-09', revenue: 512, reviews: 145, playlists: 41 }
                ]
            }
        };
        return reports[type] || reports.users;
    };

    const exportCSV = () => {
        if (!reportData?.data) return;

        const headers = Object.keys(reportData.data[0]).join(',');
        const rows = reportData.data.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="admin-reports">
            <div className="admin-page-header">
                <h1 className="admin-page-title">
                    <FileText className="page-title-icon" />
                    Raporlar
                </h1>
            </div>

            {/* Report Controls */}
            <div className="report-controls glass-card">
                <div className="control-group">
                    <label>Rapor Türü</label>
                    <div className="report-type-buttons">
                        {reportTypes.map(type => (
                            <button
                                key={type.id}
                                className={`report-type-btn ${reportType === type.id ? 'active' : ''}`}
                                onClick={() => setReportType(type.id)}
                            >
                                <type.icon size={18} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Tarih Aralığı</label>
                    <div className="date-range">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="admin-input"
                        />
                        <span>-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="admin-input"
                        />
                    </div>
                </div>

                <button className="btn btn-primary" onClick={generateReport} disabled={isLoading}>
                    <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                    Rapor Oluştur
                </button>
            </div>

            {/* Report Results */}
            {reportData && (
                <div className="report-results">
                    <div className="report-header">
                        <h2>{reportData.title}</h2>
                        <button className="btn btn-secondary" onClick={exportCSV}>
                            <Download size={16} />
                            CSV İndir
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="report-summary">
                        {Object.entries(reportData.summary).map(([key, value]) => (
                            <div key={key} className="summary-card">
                                <div className="summary-value">
                                    {typeof value === 'number' && key.includes('revenue')
                                        ? `₺${value.toLocaleString()}`
                                        : value.toLocaleString?.() || value
                                    }
                                </div>
                                <div className="summary-label">{formatLabel(key)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Data Table */}
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {reportData.data?.[0] && Object.keys(reportData.data[0]).map(key => (
                                        <th key={key}>{formatLabel(key)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.data?.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>
                                                {typeof value === 'number' && i > 0
                                                    ? value.toLocaleString()
                                                    : value
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatLabel(key) {
    const labels = {
        total: 'Toplam',
        newThisMonth: 'Bu Ay Yeni',
        active: 'Aktif',
        goldMembers: 'Gold Üye',
        thisMonth: 'Bu Ay',
        avgPerUser: 'Kullanıcı Başı Ort.',
        subscriptions: 'Abonelik',
        ratings: 'Puanlama',
        reviews: 'Yorum',
        playlists: 'Liste',
        avgRating: 'Ort. Puan',
        period: 'Dönem',
        newUsers: 'Yeni Kullanıcı',
        activeUsers: 'Aktif Kullanıcı',
        revenue: 'Gelir'
    };
    return labels[key] || key;
}
