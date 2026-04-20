import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '../../lib/api';
import type { User, Registration, Activity } from '../../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

export function ProfileView({ user, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyRegistrations();
    loadMyActivities();
  }, []);

  const loadMyRegistrations = async () => {
    try {
      const result = await apiService.getRegistrationsByStudent(user.email);
      if (result && result.data) {
        setMyRegistrations(result.data);
      }
    } catch (err) {
      console.error('加载报名记录失败:', err);
    }
  };

  const loadMyActivities = async () => {
    try {
      const result = await apiService.getActivities();
      if (result && result.data) {
        const organizerActivities = result.data.filter(a => a.organizerId === user.id);
        setMyActivities(organizerActivities);
      }
    } catch (err) {
      console.error('加载我发布的活动失败:', err);
    }
  };

  const handleSave = async () => {
    try {
      const result = await apiService.updateUser(profileData);
      if (result && result.data) {
        setIsEditing(false);
        setError('');
      }
    } catch (err) {
      setError('更新失败');
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (confirm('确定要取消报名吗？')) {
      try {
        await apiService.cancelRegistration(registrationId);
        setMyRegistrations(prev => prev.filter(r => r.id !== registrationId));
      } catch (err) {
        console.error('取消报名失败:', err);
      }
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      registered: '已报名',
      approved: '已审核',
      cancelled: '已取消',
      'checked-in': '已签到',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      registered: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      'checked-in': 'bg-purple-100 text-purple-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl text-white font-bold">{user.name.charAt(0)}</span>
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
              user.role === 'admin' ? 'bg-red-100 text-red-800' :
              user.role === 'organizer' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role === 'admin' ? '管理员' : user.role === 'organizer' ? '组织者' : '学生'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="profile-name">姓名</Label>
                  <Input
                    id="profile-name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-phone">手机号</Label>
                  <Input
                    id="profile-phone"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-college">学院</Label>
                  <Input
                    id="profile-college"
                    value={profileData.college || ''}
                    onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-major">专业</Label>
                  <Input
                    id="profile-major"
                    value={profileData.major || ''}
                    onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-grade">年级</Label>
                  <Input
                    id="profile-grade"
                    value={profileData.grade || ''}
                    onChange={(e) => setProfileData({ ...profileData, grade: e.target.value })}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSave}>保存</Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setIsEditing(false); setProfileData(user); }}>取消</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">学号</span>
                  <span>{user.studentId || '未填写'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">手机号</span>
                  <span>{user.phone || '未填写'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">学院</span>
                  <span>{user.college || '未填写'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">专业</span>
                  <span>{user.major || '未填写'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">年级</span>
                  <span>{user.grade || '未填写'}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>编辑资料</Button>
                  <Button variant="destructive" className="flex-1" onClick={onLogout}>退出登录</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>我的报名</CardTitle>
            </CardHeader>
            <CardContent>
              {myRegistrations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无报名记录</p>
              ) : (
                <div className="space-y-3">
                  {myRegistrations.map(registration => (
                    <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{registration.activity?.title || '未知活动'}</p>
                        <p className="text-sm text-gray-500">报名时间: {new Date(registration.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(registration.status)}`}>
                          {getStatusText(registration.status)}
                        </span>
                        {registration.status !== 'cancelled' && (
                          <Button variant="outline" size="sm" onClick={() => handleCancelRegistration(registration.id)}>
                            取消
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {(user.role === 'organizer' || user.role === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>我发布的活动</CardTitle>
              </CardHeader>
              <CardContent>
                {myActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无发布的活动</p>
                ) : (
                  <div className="space-y-3">
                    {myActivities.map(activity => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.startTime).toLocaleString()} · {activity.location}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status === 'approved' ? '已通过' : 
                           activity.status === 'pending' ? '待审核' : 
                           activity.status === 'rejected' ? '已拒绝' : activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}