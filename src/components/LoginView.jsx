import React, { useState } from 'react';
import { User, Users, ArrowRight, Eye, EyeOff, GraduationCap, Heart, Sparkles } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  const [userType, setUserType] = useState('student'); // 'student' or 'parent'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleDemoLogin = (type) => {
    setUsername(type === 'student' ? 'zoya.student' : 'zoya.parent');
    setPassword('password123');
    onLogin(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin(userType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 flex items-center justify-center p-4 font-sans">
      {/* 背景模糊形状 */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-12 h-12 text-violet-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-2 tracking-tight">UniApp</h1>
          <p className="text-gray-500 text-lg">连接校园与家庭的桥梁</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          {/* 身份切换 */}
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-full mb-8">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-full font-semibold transition-all duration-300 ${
                userType === 'student'
                  ? 'bg-violet-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>我是学生</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('parent')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-full font-semibold transition-all duration-300 ${
                userType === 'parent'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>我是家长</span>
            </button>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder={userType === 'student' ? '请输入学号或邮箱' : '请输入家长账号'}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-4 pr-12 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-violet-600">记住我</span>
              </label>
              <a
                href="#"
                className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
              >
                忘记密码？
              </a>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 ${
                userType === 'student'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-xl shadow-lg'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-xl shadow-lg'
              }`}
            >
              <span>安全登录</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200/80">
            <p className="text-center text-sm text-gray-500 mb-4">或一键进入演示</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="w-full py-2.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium border border-violet-200"
              >
                学生端
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('parent')}
                className="w-full py-2.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm font-medium border border-pink-200"
              >
                家长端
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-xs">
          <p>© 2025 UniApp. 保留所有权利。</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
