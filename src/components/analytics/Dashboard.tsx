import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useLocation } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { AnalyticsResponse } from '../../types';
import { getErrorMessage } from '../../services/errorUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAnalytics = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getAnalytics(start, end);
      if (response.data && response.data.data) {
        setAnalytics(response.data.data);
      } else {
        setAnalytics(null);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch analytics'));
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, location.pathname]);

  const handleApplyDateRange = () => {
    fetchAnalytics(startDate, endDate);
  };

  if (loading && !analytics) {
    return <CircularProgress />;
  }

  if (!analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No analytics data available.</Alert>
      </Box>
    );
  }

  // Prepare chart data
  const spendingByCategory = analytics.spendingByCategory || [];
  const categoryChartData = {
    labels: spendingByCategory.map((s) => s.categoryName),
    datasets: [
      {
        label: 'Spending by Category',
        data: spendingByCategory.map((s) => s.totalAmount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = analytics.monthlySpending || [];
  const monthlyChartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map((m) => m.income),
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: monthlyData.map((m) => m.expenses),
        backgroundColor: '#F44336',
        borderColor: '#F44336',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Financial Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleApplyDateRange}>
            Apply
          </Button>
        </Stack>
      </Paper>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
              ${analytics.totalIncome.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h5" sx={{ color: '#F44336', fontWeight: 'bold' }}>
              ${analytics.totalExpenses.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Net Balance
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: analytics.netBalance >= 0 ? '#4CAF50' : '#F44336',
                fontWeight: 'bold',
              }}
            >
              ${analytics.netBalance.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Save Rate
            </Typography>
            <Typography variant="h5" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
              {analytics.totalIncome > 0
                ? (((analytics.totalIncome - analytics.totalExpenses) / analytics.totalIncome) * 100).toFixed(1)
                : '0'}
              %
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Spending by Category
          </Typography>
          {spendingByCategory.length > 0 ? (
            <Box sx={{ position: 'relative', height: 300 }}>
              <Doughnut data={categoryChartData} options={chartOptions} />
            </Box>
          ) : (
            <Typography color="textSecondary">No data available</Typography>
          )}
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Monthly Income vs Expenses
          </Typography>
          {monthlyData.length > 0 ? (
            <Box sx={{ position: 'relative', height: 300 }}>
              <Bar data={monthlyChartData} options={chartOptions} />
            </Box>
          ) : (
            <Typography color="textSecondary">No data available</Typography>
          )}
        </Paper>
      </Box>

      {/* Spending by Category Details */}
      {spendingByCategory.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Spending Breakdown
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {spendingByCategory.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {item.categoryName}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ${item.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  {(item.percentage ?? 0).toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
