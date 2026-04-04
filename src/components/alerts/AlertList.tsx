import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Badge,
  Table,
  Modal,
} from '../ui';
import { AlertResponse } from '../../types';
import { alertAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import { Bell, Check, Trash2 } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alerts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your notifications and alerts
          </p>
        </div>
        {alerts.some((a) => !a.isRead) && (
          <Button
            onClick={handleMarkAllAsRead}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Alerts Table */}
      <Table.Container>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Message</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell align="center">Actions</Table.HeadCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {alerts.length === 0 ? (
              <Table.Row hoverable={false}>
                <Table.BodyCell colSpan={5}>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No alerts found</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                </Table.BodyCell>
              </Table.Row>
            ) : (
              alerts.map((alert) => (
                <Table.Row
                  key={alert.id}
                  className={!alert.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}
                >
                  <Table.BodyCell>
                    <Badge variant={
                      alert.type.includes('Error') ? 'danger' :
                      alert.type.includes('Warning') ? 'warning' :
                      alert.type.includes('Success') ? 'success' : 'primary'
                    }>
                      {alert.type}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell className="font-medium">
                    {alert.message}
                  </Table.BodyCell>
                  <Table.BodyCell className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDate(alert.createdAt)}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant={alert.isRead ? 'neutral' : 'primary'}>
                      {alert.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150"
                          aria-label="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(alert.id)}
                        className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Delete alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Table.BodyCell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Table.Container>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this alert? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteAlert}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlertList;