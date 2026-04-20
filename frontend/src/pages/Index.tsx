import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiService } from '../lib/api';
import type { Activity, Registration, Notification, PlatformStats, ViewType, User } from '../types';
import ActivitiesView from '../components/custom/ActivitiesView';
import ActivityDetailView from '../components/custom/ActivityDetailView';
import MyRegistrationsView from '../components/custom/MyRegistrationsView';
import PublishActivityView from '../components/custom/PublishActivityView';
import NotificationsView from '../components/custom/NotificationsView';
import AdminView from '../components/custom/AdminView';
import { ProfileView } from '../components/custom/ProfileView';

interface IndexProps {
  currentUser: User | null;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  lecture: '🎓 学术讲座',
  competition: '🏆 竞赛比赛',
  volunteer: '💚 志愿服务',
  art: '🎨 文艺活动',
  sports: '⚽ 体育运动',
};

const TYPE_COLORS: Record<string, string> = {
  lecture: 'bg-indigo-100 text-indigo-700',
  competition: 'bg-amber-100 text-amber-700',
  volunteer: 'bg-emerald-100 text-emerald-700',
  art: 'bg-purple-100 text-purple-700',
  sports: 'bg-green-100 text-green-700',
};

export { TYPE_LABELS, TYPE_COLORS };

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({
  currentView,
  onNavigate,
  unreadCount,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
}: {
  currentView: ViewType;
  onNavigate: (v: ViewType) => void;
  unreadCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  currentUser: User | null;
}) {
  const navItems: { label: string; view: ViewType; requireAuth?: boolean }[] = [
    { label: '活动广场', view: 'home' },
    { label: '我的报名', view: 'my-registrations', requireAuth: true },
    { label: '发布活动', view: 'publish', requireAuth: true },
    { label: '通知中心', view: 'notifications', requireAuth: true },
    { label: '管理后台', view: 'admin', requireAuth: true },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.requireAuth && !currentUser) return false;
    if (item.view === 'admin' && currentUser?.role !== 'admin') return false;
    return true;
  });

  return (
    <nav className="bg-white border-b border-[#e0e0f0] sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[#3730a3] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#3730a3] tracking-tight">Campus Pulse</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentView === item.view || (currentView === 'activity-detail' && item.view === 'home')
                    ? 'text-[#3730a3]'
                    : 'text-[#6b7280] hover:text-[#3730a3]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <>
                <button
                  onClick={() => onNavigate('notifications')}
                  className="relative p-2 rounded-full hover:bg-[#f8f7ff] transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#f59e0b] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('profile')}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#1e1b4b]">{currentUser.name}</span>
                </div>
              </>
            )}
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[#f8f7ff] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-[#1e1b4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#1e1b4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#e0e0f0] px-4 py-3 space-y-1">
          {filteredNavItems.map((item) => (
            <button
              key={item.view}
              onClick={() => { onNavigate(item.view); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.view ? 'bg-[#3730a3]/10 text-[#3730a3]' : 'text-[#6b7280] hover:bg-[#f8f7ff]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ onSearch, onNavigate }: { onSearch: (q: string) => void; onNavigate: (v: ViewType) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
    onNavigate('activities');
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#3730a3] opacity-[0.97]"></div>
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=500&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366f1] rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f59e0b] rounded-full opacity-10 translate-y-1/2 -translate-x-1/4"></div>
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></span>
            <span className="text-white/90 text-xs font-medium tracking-wide uppercase">本周新增 12 场活动</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
            发现校园精彩<br />
            <span className="text-[#f59e0b]">每一刻都值得参与</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
            一站式校园活动平台，汇聚讲座、比赛、志愿服务等全类型活动，在线报名，实时提醒，让你不再错过任何精彩。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="搜索活动名称、类型或组织者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b] shadow-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3.5 bg-[#f59e0b] hover:bg-amber-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg whitespace-nowrap text-sm"
            >
              搜索活动
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: PlatformStats | null }) {
  const items = [
    {
      icon: (
        <svg className="w-5 h-5 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bg: 'bg-[#3730a3]/10',
      value: stats?.totalActivities ?? 248,
      label: '本月活动总数',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bg: 'bg-[#10b981]/10',
      value: stats?.totalRegistrations ?? 6420,
      label: '累计报名人次',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bg: 'bg-[#f59e0b]/10',
      value: stats?.activeOrganizers ?? 86,
      label: '活跃社团组织',
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: 'bg-[#6366f1]/10',
      value: `${stats?.coverageRate ?? 94}%`,
      label: '活动信息覆盖率',
    },
  ];

  return (
    <section className="bg-white border-b border-[#e0e0f0] shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e1b4b]">{item.value.toLocaleString()}</p>
                <p className="text-xs text-[#6b7280]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Activity Card ───────────────────────────────────────────────────
function FeaturedCard({ activity, onView, onRegister }: { activity: Activity; onView: () => void; onRegister: () => void }) {
  const pct = Math.round((activity.currentParticipants / activity.maxParticipants) * 100);
  return (
    <div
      className="lg:col-span-2 group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onView}
    >
      <img
        src={activity.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=420&fit=crop'}
        alt={activity.title}
        className="w-full h-72 lg:h-80 object-cover group-hover:scale-[1.03] transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3730a3]/90 via-[#3730a3]/30 to-transparent"></div>
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 bg-[#f59e0b] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
          {TYPE_LABELS[activity.type] || activity.type}
        </span>
      </div>
      {activity.registrationDeadline && (
        <div className="absolute top-4 right-4">
          <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full">
            报名截止：{new Date(activity.registrationDeadline).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}日
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-2xl font-bold text-white leading-tight mb-2">{activity.title}</h2>
        <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-4">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(activity.startTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {activity.location}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            已报名 {activity.currentParticipants} / {activity.maxParticipants} 人
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-[#f59e0b] h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }}></div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRegister(); }}
            className="px-5 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-[1.03] shadow-md"
          >
            立即报名
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Small Activity Card ──────────────────────────────────────────────────────
function SmallActivityCard({ activity, onView }: { activity: Activity; onView: () => void }) {
  const pct = Math.round((activity.currentParticipants / activity.maxParticipants) * 100);
  return (
    <div
      className="group bg-white border border-[#e0e0f0] rounded-xl p-4 hover:border-[#3730a3]/40 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onView}
    >
      <div className="flex gap-3">
        <img
          src={activity.imageUrl || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=80&h=80&fit=crop'}
          alt={activity.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[activity.type] || 'bg-gray-100 text-gray-600'}`}>
              {TYPE_LABELS[activity.type] || activity.type}
            </span>
            <span className="text-xs text-[#10b981] font-medium">● 报名中</span>
          </div>
          <h3 className="text-sm font-semibold text-[#1e1b4b] leading-snug mb-1 truncate">{activity.title}</h3>
          <p className="text-xs text-[#6b7280]">
            {new Date(activity.startTime).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}日 {new Date(activity.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · {activity.location}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex-1 bg-[#e0e0f0] rounded-full h-1.5 mr-3">
              <div className="bg-[#6366f1] h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
            </div>
            <span className="text-xs text-[#6b7280] whitespace-nowrap">{activity.currentParticipants}/{activity.maxParticipants}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Grid Card ───────────────────────────────────────────────────────
function ActivityGridCard({
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

// ─── Registration Modal ───────────────────────────────────────────────────────
function RegistrationModal({
  activity,
  onClose,
  onSuccess,
  currentUser,
}: {
  activity: Activity;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User | null;
}) {
  const [form, setForm] = useState({
    studentName: currentUser?.name || '',
    studentId: currentUser?.studentId || '',
    studentEmail: currentUser?.email || '',
    studentPhone: currentUser?.phone || '',
    major: currentUser?.major || '',
    grade: currentUser?.grade || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.createRegistration({ activityId: activity.id, ...form });
      if (res.success) {
        toast.success('报名成功！', { description: `您已成功报名「${activity.title}」` });
        onSuccess();
        onClose();
      } else {
        toast.error('报名失败', { description: res.message });
      }
    } catch {
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1e1b4b]">活动报名</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f8f7ff] transition-colors">
              <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-[#f8f7ff] rounded-xl p-3 mb-4">
            <p className="text-sm font-semibold text-[#1e1b4b]">{activity.title}</p>
            <p className="text-xs text-[#6b7280] mt-1">
              {new Date(activity.startTime).toLocaleString('zh-CN')} · {activity.location}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1e1b4b] mb-1">姓名 *</label>
                <input
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#e0e0f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1e1b4b] mb-1">学号 *</label>
                <input
                  required
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#e0e0f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1e1b4b] mb-1">邮箱 *</label>
              <input
                required
                type="email"
                value={form.studentEmail}
                onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#e0e0f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1e1b4b] mb-1">手机号</label>
                <input
                  value={form.studentPhone}
                  onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#e0e0f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1e1b4b] mb-1">年级</label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#e0e0f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] bg-white"
                >
                  <option value="">选择年级</option>
                  <option value="18级">18级</option>
                  <option value="19级">19级</option>
                  <option value="20级">20级</option>
                  <option value="21级">21级</option>
                  <option value="22级">22级</option>
                  <option value="23级">23级</option>
                  <option value="24级">24级</option>
                  <option value="25级">25级</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1e1b4b] mb-1">专业</label>
              <input
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                placeholder="如：计算机科学与技术"
                className="w-full px-3 py-2 text-sm border border-[#e0e0f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-[#e0e0f0] text-[#6b7280] font-semibold rounded-xl text-sm hover:bg-[#f8f7ff] transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-[#3730a3] hover:bg-[#6366f1] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {loading ? '提交中...' : '确认报名'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({
  onNavigate,
  onViewActivity,
  onRegister,
  registeredIds,
  onCancelRegistration,
  initialSearch,
}: {
  onNavigate: (v: ViewType) => void;
  onViewActivity: (id: string) => void;
  onRegister: (activity: Activity) => void;
  registeredIds: Set<string>;
  onCancelRegistration: (activityId: string) => void;
  initialSearch: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [actRes, statsRes] = await Promise.all([
          apiService.getActivities({ sort: 'latest' }),
          apiService.getStats(),
        ]);
        if (actRes.success) setActivities(actRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featured = activities.find((a) => a.isFeatured) || activities[0];
  const sideActivities = activities.filter((a) => a.id !== featured?.id).slice(0, 2);
  const gridActivities = activities.filter((a) => a.id !== featured?.id).slice(0, 8);

  return (
    <div>
      <HeroSection onSearch={() => {}} onNavigate={onNavigate} />
      <StatsBar stats={stats} />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured + Side */}
        {!loading && activities.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {featured && (
              <FeaturedCard
                activity={featured}
                onView={() => onViewActivity(featured.id)}
                onRegister={() => onRegister(featured)}
              />
            )}
            <div className="flex flex-col gap-4">
              {/* Notification Banner */}
              <div className="bg-[#3730a3]/5 border border-[#3730a3]/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3730a3] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3730a3] mb-0.5">活动提醒</p>
                  <p className="text-xs text-[#6b7280] leading-relaxed">系统将在活动开始前 24 小时自动推送提醒给已报名的同学，请确保邮箱填写正确。</p>
                  <button onClick={() => onNavigate('notifications')} className="text-xs text-[#3730a3] font-medium mt-1 hover:underline">查看通知中心 →</button>
                </div>
              </div>
              {sideActivities.map((a) => (
                <SmallActivityCard key={a.id} activity={a} onView={() => onViewActivity(a.id)} />
              ))}
              {/* Organizer CTA */}
              <div className="bg-gradient-to-br from-[#f59e0b] to-amber-500 rounded-xl p-4 text-white">
                <p className="text-sm font-bold mb-1">🎯 你是活动组织者？</p>
                <p className="text-xs opacity-90 mb-3">快速发布活动，管理报名名单，导出签到表</p>
                <button
                  onClick={() => onNavigate('publish')}
                  className="w-full py-2 bg-white text-[#f59e0b] font-semibold rounded-lg text-sm hover:bg-amber-50 transition-colors duration-200"
                >
                  发布新活动
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1e1b4b]">近期活动</h2>
          <button onClick={() => onNavigate('activities')} className="text-sm text-[#3730a3] font-medium hover:underline">
            查看全部 →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#e0e0f0] rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
            {gridActivities.map((a) => (
              <ActivityGridCard
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

        {/* Organizer Section */}
        <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6 md:p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#3730a3]/10 text-[#3730a3] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
                组织者专区
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e1b4b] mb-3 leading-tight">
                高效管理你的活动<br />从发布到签到一站完成
              </h2>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-6">
                支持活动发布、报名名单实时查看、一键导出 Excel 签到表，让活动管理效率提升 50%。
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: '📝', title: '快速发布', desc: '填写表单，5分钟上线' },
                  { icon: '📋', title: '名单管理', desc: '实时查看报名情况' },
                  { icon: '📥', title: '导出签到表', desc: '一键导出 Excel' },
                  { icon: '✏️', title: '随时编辑', desc: '灵活应对突发情况' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3730a3]/10 flex items-center justify-center flex-shrink-0 text-base">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1e1b4b]">{item.title}</p>
                      <p className="text-xs text-[#6b7280]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('publish')}
                className="px-6 py-3 bg-[#3730a3] hover:bg-[#6366f1] text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] shadow-md"
              >
                立即发布活动 →
              </button>
            </div>
            <div className="bg-[#f8f7ff] rounded-xl p-5 border border-[#e0e0f0]">
              <h3 className="text-sm font-bold text-[#1e1b4b] mb-4">快速发布预览</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#1e1b4b] mb-1">活动名称</label>
                  <div className="w-full px-3 py-2.5 text-sm border border-[#e0e0f0] rounded-lg bg-white text-[#6b7280]">请输入活动名称</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1e1b4b] mb-1">活动日期</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-[#e0e0f0] rounded-lg bg-white text-[#6b7280]">选择日期</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1e1b4b] mb-1">活动类型</label>
                    <div className="w-full px-3 py-2.5 text-sm border border-[#e0e0f0] rounded-lg bg-white text-[#6b7280]">选择类型</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('publish')}
                  className="w-full py-2.5 bg-[#3730a3] hover:bg-[#6366f1] text-white font-semibold rounded-lg text-sm transition-all duration-200"
                >
                  前往发布活动
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onNavigate, currentUser }: { onNavigate: (v: ViewType) => void; currentUser: User | null }) {
  const navItems: [ViewType, string][] = [['home', '活动广场'], ['my-registrations', '我的报名'], ['publish', '发布活动'], ['notifications', '通知中心']];
  const filteredNavItems = currentUser ? navItems : [['home', '活动广场']];

  return (
    <footer className="bg-[#1e1b4b] text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#3730a3] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-lg font-bold">Campus Pulse</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              校园活动发布与报名系统，让每一位同学都能便捷参与校园生活，让每一场活动都能高效运营。
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/80">快速导航</h4>
            <ul className="space-y-2">
              {filteredNavItems.map(([view, label]) => (
                <li key={view}>
                  <button onClick={() => onNavigate(view)} className="text-sm text-white/60 hover:text-white transition-colors">{label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/80">帮助支持</h4>
            <ul className="space-y-2">
              {['使用指南', '常见问题', '联系管理员', '隐私政策'].map((item) => (
                <li key={item}><span className="text-sm text-white/60">{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 Campus Pulse. 校园活动发布与报名系统. 保留所有权利。</p>
          <p className="text-xs text-white/40">由学生信息中心运营维护</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function Index({ currentUser, currentView, onViewChange, onLogout }: IndexProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [registerActivity, setRegisterActivity] = useState<Activity | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load registrations on mount
  useEffect(() => {
    if (!currentUser) return;
    
    const loadRegistrations = async () => {
      try {
        const res = await apiService.getRegistrationsByStudent(currentUser.email);
        if (res.success) {
          const ids = new Set(res.data.filter((r) => r.status === 'registered').map((r) => r.activityId));
          setRegisteredIds(ids);
        }
      } catch {
        // ignore
      }
    };
    const loadNotifications = async () => {
      try {
        const res = await apiService.getNotifications(currentUser.email);
        if (res.success) {
          setUnreadCount(res.data.filter((n) => !n.isRead).length);
        }
      } catch {
        // ignore
      }
    };
    loadRegistrations();
    loadNotifications();
  }, [currentUser]);

  const handleNavigate = useCallback((view: ViewType) => {
    onViewChange(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onViewChange]);

  const handleViewActivity = useCallback((id: string) => {
    setSelectedActivityId(id);
    onViewChange('activity-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onViewChange]);

  const handleRegisterSuccess = useCallback((activityId: string) => {
    setRegisteredIds((prev) => new Set([...prev, activityId]));
    setUnreadCount((prev) => prev + 1);
  }, []);

  const handleCancelRegistration = useCallback(async (activityId: string) => {
    if (!currentUser) return;
    
    try {
      const regRes = await apiService.getRegistrationsByStudent(currentUser.email);
      if (regRes.success) {
        const reg = regRes.data.find((r) => r.activityId === activityId && r.status === 'registered');
        if (reg) {
          const cancelRes = await apiService.cancelRegistration(reg.id);
          if (cancelRes.success) {
            setRegisteredIds((prev) => {
              const next = new Set(prev);
              next.delete(activityId);
              return next;
            });
            toast.success('已取消报名');
          }
        }
      }
    } catch {
      toast.error('取消报名失败，请稍后重试');
    }
  }, [currentUser]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onViewActivity={handleViewActivity}
            onRegister={setRegisterActivity}
            registeredIds={registeredIds}
            onCancelRegistration={handleCancelRegistration}
            initialSearch={searchQuery}
          />
        );
      case 'activities':
        return (
          <ActivitiesView
            onViewActivity={handleViewActivity}
            onRegister={setRegisterActivity}
            registeredIds={registeredIds}
            onCancelRegistration={handleCancelRegistration}
            initialSearch={searchQuery}
          />
        );
      case 'activity-detail':
        return selectedActivityId ? (
          <ActivityDetailView
            activityId={selectedActivityId}
            onBack={() => handleNavigate('activities')}
            onRegister={setRegisterActivity}
            isRegistered={registeredIds.has(selectedActivityId)}
            onCancelRegistration={() => handleCancelRegistration(selectedActivityId)}
          />
        ) : null;
      case 'my-registrations':
        return (
          <MyRegistrationsView
            onViewActivity={handleViewActivity}
            onCancelRegistration={handleCancelRegistration}
            registeredIds={registeredIds}
          />
        );
      case 'publish':
        return <PublishActivityView onSuccess={() => handleNavigate('activities')} />;
      case 'notifications':
        return (
          <NotificationsView
            onUnreadCountChange={setUnreadCount}
            onViewActivity={handleViewActivity}
          />
        );
      case 'admin':
        return <AdminView onViewActivity={handleViewActivity} />;
      case 'profile':
        return currentUser ? (
          <ProfileView user={currentUser} onLogout={onLogout} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        unreadCount={unreadCount}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentUser={currentUser}
      />
      <div className="flex-1">
        {renderView()}
      </div>
      {currentView !== 'admin' && currentView !== 'profile' && <Footer onNavigate={handleNavigate} currentUser={currentUser} />}

      {/* Registration Modal */}
      {registerActivity && currentUser && (
        <RegistrationModal
          activity={registerActivity}
          onClose={() => setRegisterActivity(null)}
          onSuccess={() => handleRegisterSuccess(registerActivity.id)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}