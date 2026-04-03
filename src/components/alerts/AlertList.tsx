import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { AlertResponse } from '../../types';
import { alertAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';

const AlertList: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await alertAPI.getAll(page);
      if (response.data && response.data.data) {
        setAlerts(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch alerts'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await alertAPI.markAsRead(alertId);
      setAlerts(
        alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
      );
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to mark as read'));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertAPI.markAllAsRead();
      setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to mark all as read'));
    }
  };

  const handleDeleteClick = (id: number) => {
    setAlertToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteAlert = async () => {
    if (alertToDelete === null) return;
    try {
      await alertAPI.delete(alertToDelete);
      setAlerts(alerts.filter((a) => a.id !== alertToDelete));
      setOpenDeleteDialog(false);
      setAlertToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete alert'));
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  if (loading && alerts.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Alerts</h1>
        <Button variant="contained" onClick={handleMarkAllAsRead}>
          Mark All as Read
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  hover
                  sx={{
                    backgroundColor: alert.isRead ? 'transparent' : 'rgba(33, 150, 243, 0.05)',
                  }}
                >
                  <TableCell>{alert.type}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>{formatDate(alert.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={alert.isRead ? 'Read' : 'Unread'}
                      color={alert.isRead ? 'default' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {!alert.isRead && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(alert.id)}
                        color="primary"
                        title="Mark as read"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(alert.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack sx={{ mt: 3, alignItems: 'center' }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, value) => setPage(value - 1)}
          />
        </Stack>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this alert?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAlert} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertList;
