import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../lib/api';
import type { Registration, User } from '../../types';
import { TYPE_LABELS, TYPE_COLORS } from '../../pages/Index';

export default function MyRegistrationsView({
  onViewActivity,
  onCancelRegistration,
  registeredIds,
}: {
  onViewActivity: (id: string) => void;
  onCancelRegistration: (activityId: string) => void;
  registeredIds: Set<string>;
}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'registered' | 'cancelled'>('registered');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadUserData = async () => {
    try {
      const res = await apiService.getCurrentUser();
      if (res.success) {
        setCurrentUser(res.data);
      }
    } catch {
      // ignore
    }
  };

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRegistrationsByUser();
      if (res.success) setRegistrations(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    loadRegistrations();
  }, [registeredIds]);

  const filtered = registrations.filter((r) => filter === 'all' || r.status === filter);

  const handleCancel = async (reg: Registration) => {
    try {
      const res = await apiService.cancelRegistration(reg.id);
      if (res.success) {
        onCancelRegistration(reg.activityId);
        await loadRegistrations();
        toast.success('已取消报名');
      } else {
        toast.error('取消失败', { description: res.message });
      }
    } catch {
      toast.error('网络错误，请稍后重试');
    }
  };

  const isUpcoming = (startTime: string) => new Date(startTime) > new Date();

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
          {currentUser?.name?.charAt(0) || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e1b4b]">我的报名</h1>
          <p className="text-sm text-[#6b7280]">{currentUser?.name} · {currentUser?.studentId}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '全部报名', value: registrations.length, color: 'text-[#3730a3]', bg: 'bg-[#3730a3]/10' },
          { label: '已报名', value: registrations.filter((r) => r.status === 'registered').length, color: 'text-[#10b981]', bg: 'bg-[#10b981]/10' },
          { label: '已取消', value: registrations.filter((r) => r.status === 'cancelled').length, color: 'text-[#6b7280]', bg: 'bg-gray-100' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-[#6b7280] mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {([['all', '全部'], ['registered', '已报名'], ['cancelled', '已取消']] as ['all' | 'registered' | 'cancelled', string][]).map(([val, label]) => (
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
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#e0e0f0] rounded-2xl p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-[#1e1b4b] font-semibold mb-1">暂无报名记录</p>
          <p className="text-sm text-[#6b7280]">去活动广场看看有哪些感兴趣的活动吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reg) => (
            <div
              key={reg.id}
              className={`bg-white border rounded-2xl p-4 transition-all ${
                reg.status === 'cancelled' ? 'border-[#e0e0f0] opacity-60' : 'border-[#e0e0f0] hover:border-[#3730a3]/40 hover:shadow-md'
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={reg.activity?.imageUrl || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=80&h=80&fit=crop'}
                  alt={reg.activity?.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {reg.activity && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[reg.activity.type] || 'bg-gray-100 text-gray-600'}`}>
                          {TYPE_LABELS[reg.activity.type] || reg.activity.type}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        reg.status === 'registered' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-gray-100 text-[#6b7280]'
                      }`}>
                        {reg.status === 'registered' ? '已报名' : '已取消'}
                      </span>
                      {reg.activity && reg.status === 'registered' && isUpcoming(reg.activity.startTime) && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">即将开始</span>
                      )}
                    </div>
                  </div>
                  <h3
                    className="font-semibold text-[#1e1b4b] text-sm leading-snug mb-1 cursor-pointer hover:text-[#3730a3] transition-colors"
                    onClick={() => reg.activity && onViewActivity(reg.activity.id)}
                  >
                    {reg.activity?.title || '活动已删除'}
                  </h3>
                  {reg.activity && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-[#6b7280]">
                        📅 {new Date(reg.activity.startTime).toLocaleString('zh-CN')}
                      </p>
                      <p className="text-xs text-[#6b7280]">📍 {reg.activity.location}</p>
                    </div>
                  )}
                  <p className="text-xs text-[#6b7280] mt-1">报名时间：{new Date(reg.createdAt).toLocaleDateString('zh-CN')}</p>
                </div>
                {reg.status === 'registered' && reg.activity && isUpcoming(reg.activity.startTime) && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleCancel(reg)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#6b7280] border border-[#e0e0f0] rounded-lg hover:bg-red-50 hover:text-[#ef4444] hover:border-[#ef4444]/30 transition-colors"
                    >
                      取消报名
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}