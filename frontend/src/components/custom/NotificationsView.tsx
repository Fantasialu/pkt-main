import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../lib/api';
import type { Notification, User } from '../../types';

const TYPE_ICONS: Record<string, string> = {
  reminder: '🔔',
  update: '📝',
  cancellation: '❌',
};

const TYPE_COLORS: Record<string, string> = {
  reminder: 'bg-[#3730a3]/10 text-[#3730a3]',
  update: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  cancellation: 'bg-[#ef4444]/10 text-[#ef4444]',
};

export default function NotificationsView({
  onUnreadCountChange,
  onViewActivity,
}: {
  onUnreadCountChange: (count: number) => void;
  onViewActivity: (id: string) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await apiService.getCurrentUser();
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      } catch {
        // ignore
      }
    };
    loadUser();
  }, []);

  const loadNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await apiService.getUserNotifications();
      if (res.success) {
        setNotifications(res.data);
        onUnreadCountChange(res.data.filter((n) => !n.isRead).length);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      const newUnread = notifications.filter((n) => !n.isRead && n.id !== id).length;
      onUnreadCountChange(newUnread);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      await apiService.markAllNotificationsRead(currentUser.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadCountChange(0);
      toast.success('已全部标记为已读');
    } catch {
      toast.error('操作失败');
    }
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">通知中心</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {unreadCount > 0 ? `您有 ${unreadCount} 条未读通知` : '所有通知已读'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 text-sm font-semibold text-[#3730a3] border border-[#3730a3]/30 rounded-xl hover:bg-[#3730a3]/5 transition-colors"
          >
            全部标记已读
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {([['all', '全部'], ['unread', '未读']] as ['all' | 'unread', string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === val
                ? 'bg-[#3730a3] text-white'
                : 'bg-white border border-[#e0e0f0] text-[#6b7280] hover:border-[#3730a3] hover:text-[#3730a3]'
            }`}
          >
            {label}
            {val === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-[#f59e0b] text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#e0e0f0] rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#3730a3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-[#1e1b4b] font-semibold mb-1">暂无通知</p>
          <p className="text-sm text-[#6b7280]">报名活动后将收到确认和提醒通知</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`bg-white border rounded-2xl p-4 transition-all ${
                !n.isRead ? 'border-[#3730a3]/30 shadow-sm' : 'border-[#e0e0f0]'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${TYPE_COLORS[n.type] || 'bg-gray-100'}`}>
                  {TYPE_ICONS[n.type] || '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1e1b4b]">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-[#f59e0b] rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <span className="text-xs text-[#6b7280] whitespace-nowrap flex-shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b7280] leading-relaxed mt-1">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {n.activityId && (
                      <button
                        onClick={() => onViewActivity(n.activityId!)}
                        className="text-xs text-[#3730a3] font-medium hover:underline"
                      >
                        查看活动 →
                      </button>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-[#6b7280] hover:text-[#3730a3] transition-colors"
                      >
                        标记已读
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-reminder info */}
      <div className="mt-8 bg-[#3730a3]/5 border border-[#3730a3]/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#3730a3] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3730a3] mb-1">自动提醒说明</p>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              系统将在活动开始前 24 小时自动推送提醒给已报名的同学。请确保报名时填写的邮箱地址正确，以便接收提醒。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}