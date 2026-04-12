import { useState, useEffect } from 'react';
import { apiService } from '../../lib/api';
import type { Activity, ViewType } from '../../types';
import { TYPE_LABELS, TYPE_COLORS } from '../../pages/Index';

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'lecture', label: '🎓 学术讲座' },
  { value: 'competition', label: '🏆 竞赛比赛' },
  { value: 'volunteer', label: '💚 志愿服务' },
  { value: 'art', label: '🎨 文艺活动' },
  { value: 'sports', label: '⚽ 体育运动' },
];

function ActivityCard({
  activity,
  onView,
  onRegister,
  isRegistered,
  onCancelRegistration,
}: {
  activity: Activity;
  onView: () => void;
  onRegister: () => void;
  isRegistered: boolean;
  onCancelRegistration?: () => void;
}) {
  const isFull = activity.currentParticipants >= activity.maxParticipants;
  const isAlmostFull = activity.currentParticipants / activity.maxParticipants >= 0.9;

  return (
    <div
      className="group bg-white border border-[#e0e0f0] rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={onView}
    >
      <div className="relative overflow-hidden">
        <img
          src={activity.imageUrl || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=200&fit=crop'}
          alt={activity.title}
          className="w-full h-40 object-cover group-hover:scale-[1.05] transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${
            activity.type === 'competition' ? 'bg-[#f59e0b]' :
            activity.type === 'lecture' ? 'bg-[#6366f1]' :
            activity.type === 'volunteer' ? 'bg-[#10b981]' :
            activity.type === 'art' ? 'bg-purple-500' :
            'bg-green-500'
          }`}>
            {TYPE_LABELS[activity.type] || activity.type}
          </span>
        </div>
        {isAlmostFull && !isFull && (
          <div className="absolute bottom-2 left-3">
            <span className="bg-[#ef4444] text-white text-xs font-bold px-2 py-0.5 rounded-full">名额紧张</span>
          </div>
        )}
        {isFull && (
          <div className="absolute bottom-2 left-3">
            <span className="bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">名额已满</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#1e1b4b] text-sm leading-snug mb-2 line-clamp-2">{activity.title}</h3>
        <div className="space-y-1.5 mb-3">
          <p className="text-xs text-[#6b7280] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(activity.startTime).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}日 {new Date(activity.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-[#6b7280] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{activity.location}</span>
          </p>
          <p className="text-xs text-[#6b7280] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {activity.organizer}
          </p>
        </div>
        <div className="flex items-center justify-between">
          {isRegistered ? (
            <span className="text-xs text-[#10b981] font-medium">✓ 已报名</span>
          ) : (
            <span className={`text-xs font-medium ${isFull ? 'text-[#ef4444]' : 'text-[#6b7280]'}`}>
              {activity.currentParticipants}/{activity.maxParticipants} 人
            </span>
          )}
          {isRegistered ? (
            <button
              onClick={(e) => { e.stopPropagation(); onCancelRegistration?.(); }}
              className="px-3 py-1.5 bg-[#e0e0f0] text-[#6b7280] text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-[#ef4444] transition-colors duration-200"
            >
              取消报名
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onRegister(); }}
              disabled={isFull}
              className="px-3 py-1.5 bg-[#3730a3] text-white text-xs font-semibold rounded-lg hover:bg-[#6366f1] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFull ? '已满员' : '报名'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesView({
  onViewActivity,
  onRegister,
  registeredIds,
  onCancelRegistration,
  initialSearch = '',
}: {
  onViewActivity: (id: string) => void;
  onRegister: (activity: Activity) => void;
  registeredIds: Set<string>;
  onCancelRegistration: (activityId: string) => void;
  initialSearch?: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await apiService.getActivities({
        type: selectedType !== 'all' ? selectedType : undefined,
        search: search || undefined,
        sort,
      });
      if (res.success) setActivities(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedType, sort, search]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e1b4b] mb-1">活动广场</h1>
        <p className="text-sm text-[#6b7280]">浏览全校活动，找到你感兴趣的内容</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="搜索活动名称、组织者..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-[#3730a3] text-white text-sm font-semibold rounded-xl hover:bg-[#6366f1] transition-colors"
        >
          搜索
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="text-sm font-semibold text-[#1e1b4b] mr-1">活动类型：</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedType(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.03] ${
              selectedType === cat.value
                ? 'bg-[#3730a3] text-white shadow-sm'
                : 'bg-white border border-[#e0e0f0] text-[#6b7280] hover:border-[#3730a3] hover:text-[#3730a3]'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-[#6b7280] whitespace-nowrap">排序：</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-[#e0e0f0] rounded-lg px-3 py-2 bg-white text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30"
          >
            <option value="latest">最新发布</option>
            <option value="popular">最多报名</option>
            <option value="upcoming">即将开始</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-[#6b7280] mb-4">共找到 <span className="font-semibold text-[#1e1b4b]">{activities.length}</span> 个活动</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-[#e0e0f0] rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#3730a3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#1e1b4b] font-semibold mb-1">暂无相关活动</p>
          <p className="text-sm text-[#6b7280]">试试其他搜索条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onView={() => onViewActivity(a.id)}
              onRegister={() => onRegister(a)}
              isRegistered={registeredIds.has(a.id)}
              onCancelRegistration={() => onCancelRegistration(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
