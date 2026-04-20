import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../lib/api';
import type { User } from '../../types';

const ACTIVITY_TYPES = [
  { value: 'lecture', label: '🎓 学术讲座' },
  { value: 'competition', label: '🏆 竞赛比赛' },
  { value: 'volunteer', label: '💚 志愿服务' },
  { value: 'art', label: '🎨 文艺活动' },
  { value: 'sports', label: '⚽ 体育运动' },
];

const COLLEGES = [
  '金融学院',
  '商学院',
  '工程审计学院',
  '经济学院',
  '国家审计学院',
  '文学院',
  '会计学院',
  '统计与数据科学学院',
  '内部审计学院',
  '社会审计学院',
  '国家安全学院',
  '中审学院',
  '法学院',
  '计算机学院',
  '数学学院',
  '外国语学院',
];

const GRADES = [
  '25级',
  '24级',
  '23级',
  '22级',
  '21级',
  '20级',
  '19级',
  '18级',
];

const INITIAL_FORM = {
  title: '',
  description: '',
  type: '',
  location: '',
  startTime: '',
  endTime: '',
  registrationDeadline: '',
  maxParticipants: '100',
  organizer: '',
  organizerContact: '',
  imageUrl: '',
  allowedColleges: [] as string[],
  allowedMajors: '',
  allowedGrades: [] as string[],
};

export default function PublishActivityView({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await apiService.getCurrentUser();
        if (res.success && res.data) {
          setCurrentUser(res.data);
          setForm((prev) => ({ ...prev, organizer: res.data.name || '' }));
        }
      } catch {
        // ignore
      }
    };
    loadUser();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setForm((prev) => {
      const current = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...current, value] };
      }
      return { ...prev, [field]: current.filter((item) => item !== value) };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.type || !form.location || !form.startTime) {
      toast.error('请填写必填项目');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type as 'lecture' | 'competition' | 'volunteer' | 'art' | 'sports',
        location: form.location,
        startTime: new Date(form.startTime).toISOString(),
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : undefined,
        maxParticipants: parseInt(form.maxParticipants) || 100,
        organizer: form.organizer,
        organizerContact: form.organizerContact || undefined,
        imageUrl: form.imageUrl || undefined,
        status: 'pending' as const,
        allowedColleges: form.allowedColleges,
        allowedMajors: form.allowedMajors ? form.allowedMajors.split(',').map(s => s.trim()).filter(Boolean) : [],
        allowedGrades: form.allowedGrades,
      };
      const res = await apiService.createActivity(payload);
      if (res.success) {
        setSubmitted(true);
        toast.success('活动已提交审核！', { description: '管理员审核通过后将对外公开。' });
      } else {
        toast.error('提交失败', { description: res.message });
      }
    } catch {
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1e1b4b] mb-3">提交成功！</h2>
          <p className="text-[#6b7280] text-sm leading-relaxed mb-6">
            您的活动已提交审核，管理员审核通过后将对全校公开。通常在 1-2 个工作日内完成审核。
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setForm({ ...INITIAL_FORM, organizer: currentUser?.name || '' }); }}
              className="px-6 py-2.5 border border-[#e0e0f0] text-[#6b7280] font-semibold rounded-xl text-sm hover:bg-[#f8f7ff] transition-colors"
            >
              继续发布
            </button>
            <button
              onClick={onSuccess}
              className="px-6 py-2.5 bg-[#3730a3] text-white font-semibold rounded-xl text-sm hover:bg-[#6366f1] transition-colors"
            >
              查看活动列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#3730a3]/10 text-[#3730a3] text-xs font-semibold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wide">
            组织者专区
          </div>
          <h1 className="text-2xl font-bold text-[#1e1b4b] mb-1">发布新活动</h1>
          <p className="text-sm text-[#6b7280]">填写活动信息，提交审核后将对全校公开</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1e1b4b] mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">活动名称 *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="请输入活动名称"
                  className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">活动类型 *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACTIVITY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleChange('type', t.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.type === t.value
                          ? 'bg-[#3730a3] text-white border-[#3730a3]'
                          : 'bg-white text-[#6b7280] border-[#e0e0f0] hover:border-[#3730a3] hover:text-[#3730a3]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">活动简介 *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="详细描述活动内容、亮点及参与要求..."
                  className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1e1b4b] mb-4">时间与地点</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">开始时间 *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">结束时间</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">报名截止时间</label>
                <input
                  type="datetime-local"
                  value={form.registrationDeadline}
                  onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">活动地点 *</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="如：图书馆报告厅 B201"
                  className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Organizer & Capacity */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1e1b4b] mb-4">组织与容量</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">组织者 *</label>
                  <input
                    required
                    value={form.organizer}
                    onChange={(e) => handleChange('organizer', e.target.value)}
                    placeholder="社团/学院/个人名称"
                    className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">联系方式</label>
                  <input
                    value={form.organizerContact}
                    onChange={(e) => handleChange('organizerContact', e.target.value)}
                    placeholder="邮箱或手机号"
                    className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">最大报名人数</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={form.maxParticipants}
                    onChange={(e) => handleChange('maxParticipants', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e1b4b] mb-1.5">封面图片 URL</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registration Eligibility */}
          <div className="bg-white border border-[#e0e0f0] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#1e1b4b] mb-4">报名条件（可选）</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-2">限制学院</label>
                <p className="text-xs text-[#6b7280] mb-2">不选择则面向所有学院开放</p>
                <div className="flex flex-wrap gap-2">
                  {COLLEGES.map((college) => (
                    <label
                      key={college}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                        (form.allowedColleges as string[]).includes(college)
                          ? 'bg-[#3730a3] text-white'
                          : 'bg-[#f8f7ff] text-[#6b7280] hover:bg-[#e0e0f0]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(form.allowedColleges as string[]).includes(college)}
                        onChange={(e) => handleArrayChange('allowedColleges', college, e.target.checked)}
                        className="sr-only"
                      />
                      {college}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-2">限制专业班级</label>
                <p className="text-xs text-[#6b7280] mb-2">多个专业用英文逗号分隔，如：计算机1班,软件工程2班</p>
                <input
                  value={form.allowedMajors}
                  onChange={(e) => handleChange('allowedMajors', e.target.value)}
                  placeholder="如：计算机1班,软件工程2班"
                  className="w-full px-4 py-2.5 text-sm border border-[#e0e0f0] rounded-xl bg-white text-[#1e1b4b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3730a3]/30 focus:border-[#3730a3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e1b4b] mb-2">限制年级</label>
                <p className="text-xs text-[#6b7280] mb-2">不选择则面向所有年级开放</p>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((grade) => (
                    <label
                      key={grade}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                        (form.allowedGrades as string[]).includes(grade)
                          ? 'bg-[#3730a3] text-white'
                          : 'bg-[#f8f7ff] text-[#6b7280] hover:bg-[#e0e0f0]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(form.allowedGrades as string[]).includes(grade)}
                        onChange={(e) => handleArrayChange('allowedGrades', grade, e.target.checked)}
                        className="sr-only"
                      />
                      {grade}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#1e1b4b] mb-0.5">审核说明</p>
              <p className="text-xs text-[#6b7280] leading-relaxed">活动提交后需经管理员审核，审核通过后将对全校公开。请确保信息真实有效，违规内容将被拒绝。</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#3730a3] hover:bg-[#6366f1] text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? '提交中...' : '提交审核'}
          </button>
        </form>
      </div>
    </div>
  );
}