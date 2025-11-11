import React, { useState } from 'react';
import { User, Users, ArrowRight, Eye, EyeOff, GraduationCap, Heart } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  const [userType, setUserType] = useState('student'); // 'student' or 'parent'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      // 简单验证，实际项目中应该调用 API
      onLogin(userType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 登录卡片 */}
      <div className="relative w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4">
            <Heart className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">UniApp</h1>
          <p className="text-white/80 text-lg">智能校园生活助手</p>
        </div>

        {/* 身份切换 */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                userType === 'student'
                  ? 'bg-indigo-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>学生</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('parent')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                userType === 'parent'
                  ? 'bg-pink-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>家长</span>
            </button>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'student' ? '学号 / 邮箱' : '家长账号 / 手机号'}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={userType === 'student' ? '请输入学号或邮箱' : '请输入家长账号或手机号'}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">记住我</span>
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 transition-all ${
                userType === 'student'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>登录</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* 快速登录 / 演示账号 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">演示账号</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLogin('student')}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                学生端演示
              </button>
              <button
                type="button"
                onClick={() => onLogin('parent')}
                className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm font-medium"
              >
                家长端演示
              </button>
            </div>
          </div>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">还没有账号？</span>
            <button
              type="button"
              className="ml-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              立即注册
            </button>
          </div>
        </div>

        {/* 页脚 */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>© 2025 UniApp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
