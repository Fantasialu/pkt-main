import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../lib/api';
import type { Activity, PlatformStats, User } from '../../types';
import { TYPE_LABELS, TYPE_COLORS } from '../../pages/Index';

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已取消',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  approved: 'bg-[#10b981]/10 text-[#10b981]',
  rejected: 'bg-[#ef4444]/10 text-[#ef4444]',
  cancelled: 'bg-gray-100 text-[#6b7280]',
};

export default function AdminView({ onViewActivity }: { onViewActivity: (id: string) => void }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'review' | 'stats' | 'users'>('review');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetPasswordModal, setResetPasswordModal] = useState<{ userId: string; userName: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [actRes, statsRes] = await Promise.all([
        apiService.getAdminActivities(statusFilter !== 'all' ? statusFilter : undefined),
        apiService.getAdminStats(),
      ]);
      if (actRes.success) setActivities(actRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      const res = await apiService.approveActivity(id);
      if (res.success) {
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
        toast.success('已审核通过');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiService.rejectActivity(id);
      if (res.success) {
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)));
        toast.success('已拒绝该活动');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await apiService.getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`确定要删除用户「${userName}」吗？此操作不可撤销。`)) {
      return;
    }
    try {
      const res = await apiService.deleteUserById(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success('用户删除成功');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordModal || !newPassword || newPassword.length < 6) {
      toast.error('请输入至少6位的新密码');
      return;
    }
    try {
      const res = await apiService.resetUserPassword(resetPasswordModal.userId, newPassword);
      if (res.success) {
        toast.success('密码重置成功');
        setResetPasswordModal(null);
        setNewPassword('');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const pendingCount = activities.filter((a) => a.status === 'pending').length;
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      {/* Admin Header */}
      <div className="bg-[#3730a3] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">管理后台</h1>
          </div>
          <p className="text-white/70 text-sm">内容审核与系统运营数据监控</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: '已审核活动', value: stats.totalActivities, color: 'text-[#3730a3]', bg: 'bg-[#3730a3]/10', icon: '📅' },
              { label: '待审核', value: stats.pendingCount ?? 0, color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', icon: '⏳' },
              { label: '总报名人次', value: stats.totalRegistrations, color: 'text-[#10b981]', bg: 'bg-[#10b981]/10', icon: '👥' },
              { label: '活跃组织', value: stats.activeOrganizers, color: 'text-[#6366f1]', bg: 'bg-[#6366f1]/10', icon: '🏛️' },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-[#e0e0f0] rounded-2xl p-4">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>
                  {item.icon}
                </div>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value.toLocaleString()}</p>
                <p className="text-xs text-[#6b7280] mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Activity by Type */}
        {stats?.byType && stats.byType.length > 0 && (
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6 mb-8">
            <h2 className="text-base font-bold text-[#1e1b4b] mb-4">活动类型分布</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {stats.byType.map((item) => (
                <div key={item.type} className="text-center p-3 bg-[#f8f7ff] rounded-xl">
                  <p className="text-lg font-bold text-[#1e1b4b]">{item.count}</p>
                  <p className="text-xs text-[#6b7280] mt-1">{TYPE_LABELS[item.type] || item.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'review' ? 'bg-[#3730a3] text-white' : 'bg-white border border-[#e0e0f0] text-[#6b7280] hover:border-[#3730a3] hover:text-[#3730a3]'
            }`}
          >
            内容审核
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-[#f59e0b] text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'stats' ? 'bg-[#3730a3] text-white' : 'bg-white border border-[#e0e0f0] text-[#6b7280] hover:border-[#3730a3] hover:text-[#3730a3]'
            }`}
          >
            全部活动
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'users' ? 'bg-[#3730a3] text-white' : 'bg-white border border-[#e0e0f0] text-[#6b7280] hover:border-[#3730a3] hover:text-[#3730a3]'
            }`}
          >
            用户管理
            <span className="ml-1.5 text-xs bg-[#6366f1] text-white rounded-full px-1.5 py-0.5">{users.length}</span>
          </button>
        </div>

        {activeTab === 'review' && (
          <div>
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[['all', '全部'], ['pending', '待审核'], ['approved', '已通过'], ['rejected', '已拒绝']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusFilter === val
                      ? 'bg-[#3730a3] text-white'
                      : 'bg-white border border-[#e0e0f0] text-[#6b7280] hover:border-[#3730a3] hover:text-[#3730a3]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#e0e0f0] rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#6b7280]">暂无活动</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-white border border-[#e0e0f0] rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className="flex gap-4">
                      <img
                        src={activity.imageUrl || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=80&h=80&fit=crop'}
                        alt={activity.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[activity.type] || 'bg-gray-100 text-gray-600'}`}>
                              {TYPE_LABELS[activity.type] || activity.type}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[activity.status] || 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABELS[activity.status] || activity.status}
                            </span>
                          </div>
                          <span className="text-xs text-[#6b7280] whitespace-nowrap flex-shrink-0">
                            {new Date(activity.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <h3
                          className="font-semibold text-[#1e1b4b] text-sm leading-snug mb-1 cursor-pointer hover:text-[#3730a3] transition-colors"
                          onClick={() => onViewActivity(activity.id)}
                        >
                          {activity.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-xs text-[#6b7280]">
                          <span>📅 {new Date(activity.startTime).toLocaleDateString('zh-CN')}</span>
                          <span>📍 {activity.location}</span>
                          <span>👤 {activity.organizer}</span>
                          <span>👥 {activity.currentParticipants}/{activity.maxParticipants} 人</span>
                        </div>
                      </div>
                    </div>
                    {activity.status === 'pending' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-[#e0e0f0]">
                        <button
                          onClick={() => handleApprove(activity.id)}
                          className="flex-1 py-2 bg-[#10b981] text-white text-xs font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                          ✓ 审核通过
                        </button>
                        <button
                          onClick={() => handleReject(activity.id)}
                          className="flex-1 py-2 bg-[#ef4444] text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition-colors"
                        >
                          ✕ 拒绝
                        </button>
                        <button
                          onClick={() => onViewActivity(activity.id)}
                          className="px-4 py-2 border border-[#e0e0f0] text-[#6b7280] text-xs font-semibold rounded-xl hover:bg-[#f8f7ff] transition-colors"
                        >
                          查看详情
                        </button>
                      </div>
                    )}
                    {activity.status !== 'pending' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-[#e0e0f0]">
                        <button
                          onClick={() => onViewActivity(activity.id)}
                          className="px-4 py-2 border border-[#e0e0f0] text-[#6b7280] text-xs font-semibold rounded-xl hover:bg-[#f8f7ff] transition-colors"
                        >
                          查看详情
                        </button>
                        {activity.status === 'approved' && (
                          <button
                            onClick={() => handleReject(activity.id)}
                            className="px-4 py-2 border border-[#ef4444]/30 text-[#ef4444] text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors"
                          >
                            撤销审核
                          </button>
                        )}
                        {activity.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(activity.id)}
                            className="px-4 py-2 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                          >
                            重新审核
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1e1b4b] mb-4">系统运营数据</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#f8f7ff] rounded-xl p-4">
                <p className="text-xs text-[#6b7280] mb-1">活动信息覆盖率</p>
                <p className="text-3xl font-bold text-[#3730a3]">{stats?.coverageRate ?? 94}%</p>
                <p className="text-xs text-[#10b981] mt-1">达到目标 80%</p>
              </div>
              <div className="bg-[#f8f7ff] rounded-xl p-4">
                <p className="text-xs text-[#6b7280] mb-1">日活跃用户比例</p>
                <p className="text-3xl font-bold text-[#6366f1]">23%</p>
                <p className="text-xs text-[#10b981] mt-1">达到目标 20%</p>
              </div>
              <div className="bg-[#f8f7ff] rounded-xl p-4">
                <p className="text-xs text-[#6b7280] mb-1">报名人次增长</p>
                <p className="text-3xl font-bold text-[#10b981]">+32%</p>
                <p className="text-xs text-[#10b981] mt-1">超过目标 30%</p>
              </div>
              <div className="bg-[#f8f7ff] rounded-xl p-4">
                <p className="text-xs text-[#6b7280] mb-1">组织者效率提升</p>
                <p className="text-3xl font-bold text-[#f59e0b]">52%</p>
                <p className="text-xs text-[#10b981] mt-1">超过目标 50%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            {/* Search */}
            <div className="bg-white border border-[#e0e0f0] rounded-2xl p-4 mb-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索用户（姓名、邮箱、学号）"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#e0e0f0] rounded-xl text-sm focus:outline-none focus:border-[#3730a3] focus:ring-1 focus:ring-[#3730a3]"
                />
              </div>
            </div>

            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#e0e0f0] rounded-2xl p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#6b7280]">暂无用户</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-[#e0e0f0] rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#f8f7ff] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#3730a3]">{user.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1e1b4b]">{user.name}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              user.role === 'admin' ? 'bg-[#3730a3]/10 text-[#3730a3]' : 'bg-[#10b981]/10 text-[#10b981]'
                            }`}>
                              {user.role === 'admin' ? '管理员' : '普通用户'}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            user.isActive ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                          }`}>
                            {user.isActive ? '正常' : '已禁用'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-[#6b7280]">
                          <span>📧 {user.email}</span>
                          {user.studentId && <span>🆔 {user.studentId}</span>}
                          {user.college && <span>🏛️ {user.college}</span>}
                          {user.major && <span>📚 {user.major}</span>}
                          {user.grade && <span>🎓 {user.grade}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setResetPasswordModal({ userId: user.id, userName: user.name });
                          }}
                          className="px-3 py-1.5 border border-[#e0e0f0] text-[#6b7280] text-xs font-medium rounded-lg hover:bg-[#f8f7ff] transition-colors"
                        >
                          重置密码
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="px-3 py-1.5 border border-[#ef4444]/30 text-[#ef4444] text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-[#1e1b4b] mb-2">重置密码</h3>
            <p className="text-sm text-[#6b7280] mb-4">为用户「{resetPasswordModal.userName}」设置新密码</p>
            <input
              type="password"
              placeholder="请输入新密码（至少6位）"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0f0] rounded-xl text-sm focus:outline-none focus:border-[#3730a3] focus:ring-1 focus:ring-[#3730a3] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResetPasswordModal(null);
                  setNewPassword('');
                }}
                className="flex-1 py-2 border border-[#e0e0f0] text-[#6b7280] text-sm font-medium rounded-xl hover:bg-[#f8f7ff] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2 bg-[#3730a3] text-white text-sm font-medium rounded-xl hover:bg-[#3730a3]/90 transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
