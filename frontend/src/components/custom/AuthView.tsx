import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '../../lib/api';
import type { ViewType } from '../../types';

interface AuthViewProps {
  onViewChange: (view: ViewType) => void;
  onLogin: (user: any, token: string) => void;
}

export function AuthView({ onViewChange, onLogin }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    phone: '',
    major: '',
    grade: '',
    college: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiService.login(loginForm);
      if (result && result.success && result.data) {
        localStorage.setItem('token', result.data.token);
        onLogin(result.data.user, result.data.token);
        onViewChange('home');
      } else if (result.message) {
        setError(result.message);
      }
    } catch (err) {
      setError('登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiService.register(registerForm);
      if (result && result.success && result.data) {
        localStorage.setItem('token', result.data.token);
        onLogin(result.data.user, result.data.token);
        onViewChange('home');
      } else if (result.message) {
        setError(result.message);
      }
    } catch (err) {
      setError('注册失败，请检查信息是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">活动报名系统</h1>
          <p className="text-gray-500">登录或注册您的账户</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="space-y-2">
              <Label htmlFor="login-email">邮箱</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="请输入邮箱"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">密码</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="请输入密码"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <Button className="w-full mt-4" onClick={handleLogin} disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>

            <p className="text-center text-gray-500 text-sm mt-4">
              还没有账户？点击{' '}
              <button
                className="text-indigo-600 hover:text-indigo-700 underline"
                onClick={() => setActiveTab('register')}
              >
                注册
              </button>
            </p>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="register-name">姓名</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="请输入姓名"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">邮箱</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="请输入邮箱"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">密码</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="请输入密码（至少6位）"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-studentId">学号（可选）</Label>
              <Input
                id="register-studentId"
                type="text"
                placeholder="请输入学号"
                value={registerForm.studentId}
                onChange={(e) => setRegisterForm({ ...registerForm, studentId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-college">学院（可选）</Label>
              <Input
                id="register-college"
                type="text"
                placeholder="请输入学院"
                value={registerForm.college}
                onChange={(e) => setRegisterForm({ ...registerForm, college: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-major">专业（可选）</Label>
              <Input
                id="register-major"
                type="text"
                placeholder="请输入专业"
                value={registerForm.major}
                onChange={(e) => setRegisterForm({ ...registerForm, major: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-grade">年级（可选）</Label>
              <Input
                id="register-grade"
                type="text"
                placeholder="请输入年级（如：24级）"
                value={registerForm.grade}
                onChange={(e) => setRegisterForm({ ...registerForm, grade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-phone">手机号（可选）</Label>
              <Input
                id="register-phone"
                type="tel"
                placeholder="请输入手机号"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              />
            </div>

            <Button className="w-full mt-4" onClick={handleRegister} disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>

            <p className="text-center text-gray-500 text-sm mt-4">
              已有账户？点击{' '}
              <button
                className="text-indigo-600 hover:text-indigo-700 underline"
                onClick={() => setActiveTab('login')}
              >
                登录
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}