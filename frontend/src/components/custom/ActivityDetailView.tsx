import { useState, useEffect } from 'react';
import { apiService } from '../../lib/api';
import type { Activity, Registration } from '../../types';
import { TYPE_LABELS, TYPE_COLORS } from '../../pages/Index';

export default function ActivityDetailView({
  activityId,
  onBack,
  onRegister,
  isRegistered,
  onCancelRegistration,
}: {
  activityId: string;
  onBack: () => void;
  onRegister: (activity: Activity) => void;
  isRegistered: boolean;
  onCancelRegistration: () => void;
}) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiService.getActivity(activityId);
        if (res.success) setActivity(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activityId]);

  const loadRegistrations = async () => {
    try {
      const res = await apiService.getRegistrationsByActivity(activityId);
      if (res.success) setRegistrations(res.data);
      setShowRegistrations(true);
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    if (!registrations.length) return;
    const headers = ['姓名', '学号', '邮箱', '手机', '专业', '年级', '报名时间'];
    const rows = registrations.map((r) => [
      r.studentName, r.studentId, r.studentEmail,
      r.studentPhone || '', r.major || '', r.grade || '',
      new Date(r.createdAt).toLocaleString('zh-CN'),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activity?.title || '活动'}_报名名单.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-[#6b7280]">活动不存在</p>
        <button onClick={onBack} className="mt-4 text-[#3730a3] hover:underline text-sm">返回列表</button>
      </div>
    );
  }

  const pct = Math.round((activity.currentParticipants / activity.maxParticipants) * 100);
  const isFull = activity.currentParticipants >= activity.maxParticipants;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#3730a3] transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回活动列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <img
              src={activity.imageUrl || 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=400&fit=crop'}
              alt={activity.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`text-white text-xs font-bold px-3 py-1.5 rounded-full ${
                activity.type === 'competition' ? 'bg-[#f59e0b]' :
                activity.type === 'lecture' ? 'bg-[#6366f1]' :
                activity.type === 'volunteer' ? 'bg-[#10b981]' :
                activity.type === 'art' ? 'bg-purple-500' :
                'bg-green-500'
              }`}>
                {TYPE_LABELS[activity.type] || activity.type}
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#1e1b4b] mb-4 leading-tight">{activity.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-[#f8f7ff] rounded-xl p-3">
              <div className="w-8 h-8 bg-[#3730a3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">开始时间</p>
                <p className="text-sm font-semibold text-[#1e1b4b]">{new Date(activity.startTime).toLocaleString('zh-CN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f8f7ff] rounded-xl p-3">
              <div className="w-8 h-8 bg-[#3730a3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">活动地点</p>
                <p className="text-sm font-semibold text-[#1e1b4b]">{activity.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f8f7ff] rounded-xl p-3">
              <div className="w-8 h-8 bg-[#3730a3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">组织者</p>
                <p className="text-sm font-semibold text-[#1e1b4b]">{activity.organizer}</p>
              </div>
            </div>
            {activity.registrationDeadline && (
              <div className="flex items-center gap-3 bg-[#f8f7ff] rounded-xl p-3">
                <div className="w-8 h-8 bg-[#f59e0b]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">报名截止</p>
                  <p className="text-sm font-semibold text-[#1e1b4b]">{new Date(activity.registrationDeadline).toLocaleString('zh-CN')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1e1b4b] mb-3">活动简介</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-wrap">{activity.description}</p>
          </div>

          {/* Eligibility Criteria */}
          {(activity.allowedColleges && JSON.parse(activity.allowedColleges).length > 0) || 
           (activity.allowedMajors && JSON.parse(activity.allowedMajors).length > 0) || 
           (activity.allowedGrades && JSON.parse(activity.allowedGrades).length > 0) ? (
            <div className="bg-[#f8f7ff] border border-[#e0e0f0] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-bold text-[#1e1b4b]">报名条件</h2>
              </div>
              <div className="space-y-3">
                {activity.allowedColleges && JSON.parse(activity.allowedColleges).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#3730a3] bg-[#3730a3]/10 px-2 py-1 rounded">学院</span>
                    <span className="text-sm text-[#6b7280]">{JSON.parse(activity.allowedColleges).join('、')}</span>
                  </div>
                )}
                {activity.allowedMajors && JSON.parse(activity.allowedMajors).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded">专业班级</span>
                    <span className="text-sm text-[#6b7280]">{JSON.parse(activity.allowedMajors).join('、')}</span>
                  </div>
                )}
                {activity.allowedGrades && JSON.parse(activity.allowedGrades).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded">年级</span>
                    <span className="text-sm text-[#6b7280]">{JSON.parse(activity.allowedGrades).join('、')}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Registrations List (Organizer View) */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1e1b4b]">报名名单</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadRegistrations}
                  className="px-3 py-1.5 text-xs font-semibold text-[#3730a3] border border-[#3730a3]/30 rounded-lg hover:bg-[#3730a3]/5 transition-colors"
                >
                  查看名单
                </button>
                {registrations.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#10b981] rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    导出 CSV
                  </button>
                )}
              </div>
            </div>
            {showRegistrations ? (
              registrations.length === 0 ? (
                <p className="text-sm text-[#6b7280] text-center py-4">暂无报名记录</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e0e0f0]">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#6b7280]">姓名</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#6b7280]">学号</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#6b7280] hidden sm:table-cell">邮箱</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#6b7280] hidden md:table-cell">专业</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#6b7280] hidden md:table-cell">年级</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => (
                        <tr key={r.id} className="border-b border-[#e0e0f0]/50 hover:bg-[#f8f7ff]">
                          <td className="py-2 px-3 text-[#1e1b4b] font-medium">{r.studentName}</td>
                          <td className="py-2 px-3 text-[#6b7280]">{r.studentId}</td>
                          <td className="py-2 px-3 text-[#6b7280] hidden sm:table-cell">{r.studentEmail}</td>
                          <td className="py-2 px-3 text-[#6b7280] hidden md:table-cell">{r.major || '-'}</td>
                          <td className="py-2 px-3 text-[#6b7280] hidden md:table-cell">{r.grade || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="text-sm text-[#6b7280] text-center py-4">点击“查看名单”加载报名信息</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration Card */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6 sticky top-20">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1e1b4b]">报名人数</span>
                <span className={`text-sm font-bold ${isFull ? 'text-[#ef4444]' : 'text-[#3730a3]'}`}>
                  {activity.currentParticipants} / {activity.maxParticipants}
                </span>
              </div>
              <div className="w-full bg-[#e0e0f0] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isFull ? 'bg-[#ef4444]' : 'bg-[#3730a3]'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#6b7280] mt-1">{pct}% 已抡满</p>
            </div>

            {isRegistered ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] rounded-xl p-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold">已成功报名</span>
                </div>
                <button
                  onClick={onCancelRegistration}
                  className="w-full py-2.5 border border-[#ef4444]/30 text-[#ef4444] font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors"
                >
                  取消报名
                </button>
              </div>
            ) : (
              <button
                onClick={() => onRegister(activity)}
                disabled={isFull}
                className="w-full py-3 bg-[#3730a3] hover:bg-[#6366f1] text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isFull ? '名额已满' : '立即报名'}
              </button>
            )}

            {activity.registrationDeadline && (
              <p className="text-xs text-[#6b7280] text-center mt-3">
                报名截止：{new Date(activity.registrationDeadline).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>

          {/* Organizer Info */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-4">
            <h3 className="text-sm font-bold text-[#1e1b4b] mb-3">组织者信息</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3730a3]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3730a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1e1b4b]">{activity.organizer}</p>
                {activity.organizerContact && (
                  <p className="text-xs text-[#6b7280]">{activity.organizerContact}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
