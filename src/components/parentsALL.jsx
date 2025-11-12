import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from '../i18n';
import { 
    Home, 
    GraduationCap, 
    Calendar, 
    Heart, 
    Sparkles, 
    Mail, 
    Settings,
    Bell,
    ChevronRight,
    MapPin,
    Clock,
    Book,
    CheckSquare,
    Users,
    BarChart2,
    CheckCircle2,
    Hourglass,
    Star,
    Check,
    Plus,
    X,
    MessageCircle,
    Send,
    BedDouble,
    Footprints, // Was: Walk
    Activity,
    MoonStar, // Was: MoonStars
    UserCheck,
    CupSoda,
    ChevronsUpDown,
    ChevronLeft,
    ChevronDown,
    Building2,
    Search,
    Paperclip,
    ArrowLeft,
    Circle,
    CheckCircle,
    Clock3,
    AlertCircle,
    Info,
    Lock,
    Trophy,
    PartyPopper, // 新增
    AlertTriangle, // 新增
    UserCircle, // 新增
    Languages, // 新增
    ListChecks, // 新增
    CalendarPlus, // 新增
    // BookClosed // Removed this icon
} from 'lucide-react';

// 统一从 mockData 导入数据，确保学生端与家长端一致
import {
    courses,
    calendarEvents as sharedCalendarEvents,
    activities as sharedActivities,
    emails as sharedEmails,
    emailDetails as sharedEmailDetails,
    todoItems as sharedTodoItems,
} from '../mockData';

// --- 数据模拟（改为统一来源） ---
// 基于 Student 侧的 todoItems 转换为家长视图所需结构
const mockTodoItems = sharedTodoItems.map(t => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
    priority: t.priority || 'medium',
    category: t.course || '作业',
    notes: t.notes || '',
    isCompleted: !!t.isCompleted,
    source: '学生端'
}));

// 邮件改为统一来源
const mockEmails = sharedEmails;

// 邮件详情改为统一来源
const mockEmailDetails = sharedEmailDetails;

// Mock 健康数据
const mockHealthData = {
    day: [
        { id: 1, icon: BedDouble, title: '睡眠', value: '7.5', unit: 'h', progress: 0.83, status: '良好', color: 'indigo-500' },
        { id: 2, icon: Footprints, title: '步数', value: '8,234', unit: '步', progress: 0.82, status: '优秀', color: 'green-500' },
        { id: 3, icon: Activity, title: '活跃', value: '45', unit: 'min', progress: 0.75, status: '良好', color: 'orange-500' },
        { id: 4, icon: CupSoda, title: '饮水', value: '1.8', unit: 'L', progress: 0.72, status: '正常', color: 'blue-500' }
    ],
    week: [
        { id: 1, icon: BedDouble, title: '平均睡眠', value: '7.2', unit: 'h', progress: 0.80, status: '良好', color: 'indigo-500' },
        { id: 2, icon: Footprints, title: '平均步数', value: '7,856', unit: '步', progress: 0.79, status: '良好', color: 'green-500' },
        { id: 3, icon: Activity, title: '总活跃', value: '5.2', unit: 'h', progress: 0.74, status: '良好', color: 'orange-500' },
        { id: 4, icon: CupSoda, title: '平均饮水', value: '1.6', unit: 'L', progress: 0.64, status: '偏低', color: 'blue-500' }
    ],
    month: [
        { id: 1, icon: BedDouble, title: '平均睡眠', value: '7.1', unit: 'h', progress: 0.79, status: '良好', color: 'indigo-500' },
        { id: 2, icon: Footprints, title: '平均步数', value: '7,623', unit: '步', progress: 0.76, status: '良好', color: 'green-500' },
        { id: 3, icon: Activity, title: '总活跃', value: '22', unit: 'h', progress: 0.73, status: '良好', color: 'orange-500' },
        { id: 4, icon: CupSoda, title: '平均饮水', value: '1.5', unit: 'L', progress: 0.60, status: '偏低', color: 'blue-500' }
    ]
};

// 学业数据：从统一 courses.completed 映射
const mockCompletedCourses = courses.completed.map(c => {
    const findScore = (label) => c.components?.find(x => x.name.includes(label))?.score ?? null;
    const assignments = findScore('作业') ?? findScore('项目') ?? c.components?.[0]?.score ?? null;
    const midterm = findScore('期中') ?? null;
    const final = findScore('期末') ?? c.components?.slice(-1)?.[0]?.score ?? null;
    return {
        code: c.code,
        name: c.name,
        finalGrade: c.finalGrade,
        credit: c.credit,
        semester: c.semester,
        lecturer: c.lecturer || '授课教师',
        assignments,
        midterm,
        final,
    };
});

// 进行中课程：从统一 courses.ongoing 映射
const mockOngoingCourses = courses.ongoing.map(c => ({
    code: c.code,
    name: c.name,
    currentGrade: typeof c.currentGrade === 'string' ? parseInt(c.currentGrade) || 0 : c.currentGrade,
    credit: c.credit ?? 15,
    lecturer: c.lecturer,
    progress: c.progress ?? 0,
    nextDeadline: c.nextDeadline || ''
}));

// 日历事件：从统一 calendarEvents 映射，并转换为 Date 对象
const mockCalendarEvents = sharedCalendarEvents.map(e => ({
    ...e,
    id: e.id,
    startTime: new Date(e.startTime),
    endTime: new Date(e.endTime),
}));

// 校园活动：从统一 activities 映射
const mockActivities = sharedActivities.map(a => ({
    id: a.id,
    title: a.title,
    date: a.date ? new Date(`${a.date}T${a.startTime || '00:00'}`) : new Date(),
    location: a.location,
    category: a.type || '活动',
    description: a.description,
}));


// --- 辅助 Hook 和函数 ---

// 用于管理 Todos 的 Hook (模拟 AppState)
function useTodoManager(initialTodos) {
    const [todos, setTodos] = useState(initialTodos);

    const incompleteTodos = useMemo(() => 
        todos.filter(t => !t.isCompleted).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0)),
        [todos]
    );

    const completedTodos = useMemo(() =>
        todos.filter(t => t.isCompleted).sort((a, b) => b.dueDate - a.dueDate),
        [todos]
    );

    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return incompleteTodos.filter(t => t.dueDate && t.dueDate > now && t.dueDate <= next7Days);
    }, [incompleteTodos]);
    
    const overdueTodos = useMemo(() => {
        const now = new Date();
        return incompleteTodos.filter(t => t.dueDate && t.dueDate < now);
    }, [incompleteTodos]);

    const addTodo = (newTodoData) => {
        const newTodo = {
            ...newTodoData,
            id: (Math.random() * 10000).toString(),
            isCompleted: false,
            source: '家长添加'
        };
        setTodos(prev => [newTodo, ...prev]);
    };
    
    const updateTodo = (id, updatedData) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    };

    const toggleTodo = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    return { 
        todos, 
        addTodo, 
        updateTodo, 
        toggleTodo,
        incompleteTodos,
        completedTodos,
        upcomingDeadlines,
        overdueTodos
    };
}

// 日期格式化
function formatDate(date, options = {}) {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', options);
}

function formatTime(date, options = {}) {
    const d = new Date(date);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', ...options });
}

// --- 通用 UI 组件 ---

/**
 * 玻璃拟态卡片 (对应 .ultraThinMaterial)
 * 这是整个 UI 的核心样式
 */
const GlassCard = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 ${className}`}
        >
            {children}
        </div>
    );
};

/**
 * 模拟 iOS 的 Segmented Control
 */
const SegmentedControl = ({ options, selected, setSelected, className = '' }) => {
    return (
        <div className={`flex w-full bg-gray-200/70 rounded-full p-1 ${className}`}>
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => setSelected(option.value)}
                    className={`flex-1 text-center px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300
                        ${selected === option.value 
                            ? 'bg-white shadow-md text-violet-600' 
                            : 'bg-transparent text-gray-600 hover:bg-white/50'}
                    `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

/**
 * 弹窗 Modal 框架
 */
const ModalWrapper = ({ children, closeModal, title = "详情" }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={closeModal}
        >
            <div 
                className="bg-slate-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Modal Content */}
                <div className="overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- 首页 (Dashboard) 组件 ---
// 对应 ParentDashboardView.swift

const StudentStatusCard = () => (
    <GlassCard className="p-6">
        <div className="flex items-center space-x-4">
            {/* 头像 */}
            <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-white text-2xl font-bold">ZH</span>
                </div>
            </div>
            {/* 学生信息 */}
            <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-900">Zoya Huo</h2>
                <p className="text-sm font-medium text-gray-600">MSc Health Data Science</p>
                <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1">
                    <Building2 size={12} className="text-violet-600" />
                    <span>University College London</span>
                </div>
            </div>
        </div>
        
        <div className="border-t border-gray-200/80 my-4"></div>
        
        {/* 状态指示器 */}
        <div className="flex justify-around space-x-2">
            <ParentStatusIndicator icon={CheckCircle2} title="活跃" subtitle="学习状态良好" color="text-green-600" bgColor="bg-green-100" />
            <ParentStatusIndicator icon={Clock} title="准时" subtitle="按时完成任务" color="text-violet-600" bgColor="bg-violet-100" />
            <ParentStatusIndicator icon={Star} title="优秀" subtitle="学术表现优异" color="text-amber-500" bgColor="bg-amber-100" />
        </div>
    </GlassCard>
);

const ParentStatusIndicator = ({ icon: Icon, title, subtitle, color, bgColor }) => (
    <div className="flex flex-col items-center text-center flex-1 space-y-2">
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
            <Icon size={22} className={color} />
        </div>
        <div>
            <p className="text-sm font-bold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500 leading-tight">{subtitle}</p>
        </div>
    </div>
);

const QuickAccessCard = ({ onHealthTap, onEmailTap }) => (
    <GlassCard className="p-5">
        <div className="flex items-center space-x-2 mb-4">
            <Home size={18} className="text-violet-600" />
            <h3 className="text-lg font-bold text-gray-800">快捷入口</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <QuickAccessButton
                icon={Heart}
                title="健康观察"
                subtitle="睡眠·运动·压力"
                color="text-red-500"
                bgColor="bg-red-100"
                onClick={onHealthTap}
            />
            <QuickAccessButton
                icon={Mail}
                title="邮件通知"
                subtitle="3 封未读"
                color="text-violet-600"
                bgColor="bg-violet-100"
                onClick={onEmailTap}
            />
        </div>
    </GlassCard>
);

const QuickAccessButton = ({ icon: Icon, title, subtitle, color, bgColor, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white/60 rounded-xl p-4 flex flex-col items-center text-center space-y-2.5 hover:bg-white transition-all"
    >
        <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center`}>
            <Icon size={24} className={color} />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    </button>
);

const AcademicOverviewCard = ({ onNavigate }) => {
    const averageGrade = 81.7; // 模拟数据
    const completedCoursesCount = 2;
    const ongoingCoursesCount = 5;

    const gradeColor = (grade) => {
        if (grade >= 70) return 'text-green-600';
        if (grade >= 60) return 'text-amber-500';
        if (grade >= 50) return 'text-violet-500';
        return 'text-red-500';
    };

    const degreeLevel = (average) => {
        if (average >= 70) return '🏆 一等学位水平';
        if (average >= 60) return '⭐ 二等学位水平';
        if (average >= 50) return '✓ 及格水平';
        return '需要努力';
    };

    return (
        <GlassCard className="p-5 cursor-pointer" onClick={onNavigate}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <GraduationCap size={20} className="text-violet-600" />
                    <h3 className="text-lg font-bold text-gray-800">学业总览</h3>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
                <div className={`text-6xl font-bold ${gradeColor(averageGrade)}`}>
                    {averageGrade.toFixed(1)}
                </div>
                <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-700">平均分</p>
                    <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        {degreeLevel(averageGrade)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">基于 {completedCoursesCount} 门已完成课程</p>
                </div>
            </div>

            <div className="border-t border-gray-200/80 my-4"></div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-700">已完成</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{completedCoursesCount} 门</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Hourglass size={16} className="text-violet-600" />
                        <span className="text-sm font-medium text-gray-700">进行中</span>
                    </div>
                    <span className="text-sm font-bold text-violet-600">{ongoingCoursesCount} 门</span>
                </div>
            </div>
            
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-4">
                <Info size={12} />
                <span>本学期课程结束后将更新成绩</span>
            </div>
        </GlassCard>
    );
};

const TodoOverviewCard = ({ todos, onTodoTap, onViewAllTodos }) => {
    const upcomingTodos = todos.slice(0, 3);

    return (
        <GlassCard className="p-5">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <CheckSquare size={20} className="text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-800">待办事项</h3>
                </div>
                <button 
                    onClick={onViewAllTodos}
                    className="text-sm font-medium text-violet-600 hover:text-violet-800"
                >
                    查看全部
                </button>
            </div>
            
            {upcomingTodos.length === 0 ? (
                <div className="text-center py-10">
                    <CheckCircle2 size={40} className="text-green-500 mx-auto" />
                    <p className="mt-2 text-sm font-medium text-gray-600">太棒了！暂无待办事项</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {upcomingTodos.map(todo => (
                        <TodoItemRow key={todo.id} todo={todo} onClick={() => onTodoTap(todo)} />
                    ))}
                </div>
            )}
        </GlassCard>
    );
};

const TodoItemRow = ({ todo, onClick }) => {
    const priorityColor = {
        urgent: 'bg-red-500',
        high: 'bg-red-400',
        medium: 'bg-amber-400',
        low: 'bg-green-400'
    };

    const timeLeft = (dueDate) => {
        if (!dueDate) return '无截止日期';
        const diff = new Date(dueDate).getTime() - new Date().getTime();
        if (diff < 0) return '已截止';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days} 天后截止`;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours > 0) return `${hours} 小时后截止`;
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} 分钟后截止`;
    };
    
    const isUrgent = (dueDate) => {
        if (!dueDate) return false;
        const diff = new Date(dueDate).getTime() - new Date().getTime();
        return diff < 24 * 60 * 60 * 1000 && diff > 0;
    };

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center space-x-3 bg-white/60 p-3 rounded-lg hover:bg-white transition-all"
        >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor[todo.priority]}`}></div>
            <div className="flex-grow text-left min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{todo.title}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                    <div className={`flex items-center space-x-1 ${isUrgent(todo.dueDate) ? 'text-red-500' : ''}`}>
                        <Clock size={12} />
                        <span>{timeLeft(todo.dueDate)}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span>{todo.category}</span>
                </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        </button>
    );
};

const AttendanceHeatmapCardEnhanced = () => {
    // 模拟最近4周的出勤数据（周一到周五）
    const attendanceData = [
        [true, true, false, true, true], // 3周前
        [true, true, true, true, true], // 2周前
        [true, false, true, true, true], // 上周
        [true, true, true, false, false] // 本周 (假设今天是周三)
    ];
    const days = ['一', '二', '三', '四', '五'];
    const weeks = ['W-3', 'W-2', '上周', '本周'];

    return (
        <GlassCard className="p-5">
            <div className="flex items-center space-x-2 mb-4">
                <BarChart2 size={18} className="text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">📈 出勤热力图</h3>
            </div>
            
            <div className="space-y-2">
                {/* 星期标签 */}
                <div className="flex">
                    <div className="w-10 flex-shrink-0"></div>
                    <div className="flex-grow grid grid-cols-5 gap-1.5">
                        {days.map(day => (
                            <span key={day} className="text-xs font-medium text-gray-500 text-center">周{day}</span>
                        ))}
                    </div>
                </div>
                {/* 热力图格子 */}
                {attendanceData.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex items-center">
                        <div className="w-10 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-500">{weeks[weekIndex]}</span>
                        </div>
                        <div className="flex-grow grid grid-cols-5 gap-1.5">
                            {week.map((isPresent, dayIndex) => {
                                const isFuture = weekIndex === 3 && dayIndex > 2; // 模拟未来
                                let bgColor = 'bg-gray-200/70';
                                if (!isFuture) {
                                    bgColor = isPresent ? 'bg-green-500' : 'bg-red-400';
                                }
                                return (
                                    <div key={dayIndex} className={`w-full h-8 rounded ${bgColor}`}></div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="border-t border-gray-200/80 my-4"></div>
            
            {/* 统计摘要 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-100/70 rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold text-green-700">95%</p>
                    <p className="text-xs font-medium text-green-800">本月出勤率</p>
                </div>
                <div className="bg-violet-100/70 rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold text-violet-700">100%</p>
                    <p className="text-xs font-medium text-violet-800">本周出勤率</p>
                </div>
            </div>
        </GlassCard>
    );
};

const ParentDashboardView = ({ setModal, setActiveTab }) => {
    const { upcomingDeadlines } = useTodoManager(mockTodoItems);

    return (
        <div className="p-4 space-y-6">
            <StudentStatusCard />
            <QuickAccessCard
                onHealthTap={() => setActiveTab('health')}
                onEmailTap={() => setActiveTab('mail')}
            />
            <AcademicOverviewCard onNavigate={() => setActiveTab('academics')} />
            <TodoOverviewCard
                todos={upcomingDeadlines}
                onTodoTap={(todo) => setModal({ type: 'todoDetail', data: todo })}
                onViewAllTodos={() => console.log('View all todos...')} // 实际应导航到待办事项页面
            />
            <AttendanceHeatmapCardEnhanced />
        </div>
    );
};


// --- 学业 (Academics) 组件 ---
// 对应 ParentAcademicDetailView.swift

const ParentAcademicDetailView = () => {
    const [selectedSemester, setSelectedSemester] = useState('本学期');
    
    const semesters = [
        { label: '全部', value: '全部' },
        { label: '本学期', value: '本学期' },
        { label: '上学期', value: '上学期' }
    ];

    const filteredCourses = useMemo(() => {
        if (selectedSemester === '全部') return mockCompletedCourses;
        return mockCompletedCourses.filter(c => c.semester === selectedSemester);
    }, [selectedSemester]);

    const overallAverage = useMemo(() => {
        if (mockCompletedCourses.length === 0) return 0;
        const total = mockCompletedCourses.reduce((acc, course) => acc + course.finalGrade, 0);
        return total / mockCompletedCourses.length;
    }, []);
    
    const gradeColor = (grade) => {
        if (grade >= 70) return 'text-green-600';
        if (grade >= 60) return 'text-amber-500';
        if (grade >= 50) return 'text-violet-500';
        return 'text-red-500';
    };

    const degreeClassification = (average) => {
        if (average >= 70) return '一等学位水平 (Distinction)';
        if (average >= 60) return '二等学位水平 (Merit)';
        if (average >= 50) return '及格水平 (Pass)';
        return '需要努力';
    };

    return (
        <div className="p-4 space-y-6">
            {/* 总体成绩概览 */}
            <GlassCard className="p-6">
                <div className="text-center space-y-2 mb-5">
                    <p className={`text-6xl font-bold ${gradeColor(overallAverage)}`}>
                        {overallAverage.toFixed(1)}
                    </p>
                    <p className="text-base font-medium text-gray-600">总平均分</p>
                </div>
                <div className="flex justify-center">
                    <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-flex items-center space-x-1.5">
                        <Trophy size={14} />
                        <span>{degreeClassification(overallAverage)}</span>
                    </span>
                </div>
                
                <div className="border-t border-gray-200/80 my-5"></div>
                
                <div className="flex justify-around">
                    <StatItem icon={CheckCircle2} label="已完成" value={mockCompletedCourses.length} color="text-green-600" bgColor="bg-green-100" />
                    <StatItem icon={Hourglass} label="进行中" value={mockOngoingCourses.length} color="text-violet-600" bgColor="bg-violet-100" />
                    <StatItem icon={Star} label="学分" value={mockCompletedCourses.reduce((acc, c) => acc + c.credit, 0)} color="text-amber-500" bgColor="bg-amber-100" />
                </div>
            </GlassCard>

            {/* 学期筛选器 */}
            <SegmentedControl
                options={semesters}
                selected={selectedSemester}
                setSelected={setSelectedSemester}
            />

            {/* 课程列表 */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-lg font-bold text-gray-800">
                        {selectedSemester}课程
                    </h3>
                    <span className="text-sm font-medium text-gray-500">
                        {filteredCourses.length} 门
                    </span>
                </div>
                
                {filteredCourses.length === 0 ? (
                    <GlassCard className="p-6 text-center">
                        <Book size={40} className="text-violet-400 mx-auto" /> {/* Was: BookClosed */}
                        <p className="mt-3 text-base font-semibold text-gray-800">本学期课程进行中</p>
                        <p className="text-sm text-gray-500 mt-1">课程结束后将显示最终成绩</p>
                        <div className="bg-white/60 rounded-xl p-4 mt-4 text-left space-y-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">本学期进行中课程：</p>
                            {mockOngoingCourses.map(course => (
                                <div key={course.code} className="flex items-start justify-between space-x-3 pb-2 border-b border-gray-200/50 last:border-0">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                                            <span className="text-xs font-semibold text-gray-800">{course.code}</span>
                                        </div>
                                        <p className="text-xs text-gray-700 mt-0.5 ml-3.5">{course.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 ml-3.5">教师: {course.lecturer}</p>
                                        <p className="text-xs text-violet-600 mt-1 ml-3.5">📅 {course.nextDeadline}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-base font-bold text-violet-600">{course.currentGrade}</p>
                                        <p className="text-xs text-gray-500">当前分数</p>
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div 
                                                className="bg-violet-500 h-1.5 rounded-full" 
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">{course.progress}% 完成</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ) : (
                    filteredCourses.map(course => (
                        <CompletedCourseCard key={course.id} course={course} />
                    ))
                )}
            </div>

            {/* 成绩说明 */}
            <GradeExplanationCard />
        </div>
    );
};

const StatItem = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="flex flex-col items-center text-center space-y-2">
        <div className={`w-11 h-11 rounded-full ${bgColor} flex items-center justify-center`}>
            <Icon size={20} className={color} />
        </div>
        <div>
            <p className="text-lg font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);

const CompletedCourseCard = ({ course }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    const gradeColor = (grade) => {
        if (grade >= 70) return 'text-green-600';
        if (grade >= 60) return 'text-amber-500';
        if (grade >= 50) return 'text-violet-500';
        return 'text-red-500';
    };

    return (
        <GlassCard className="p-5">
            <div className="flex justify-between items-start">
                <div className="flex-grow min-w-0 pr-4">
                    <h4 className="text-base font-semibold text-gray-900 truncate">{course.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{course.code}</span>
                        <span>•</span>
                        <span>{course.credit} 学分</span>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className={`text-4xl font-bold ${gradeColor(course.finalGrade)}`}>
                        {course.finalGrade}
                    </p>
                    <p className={`text-xs font-medium ${gradeColor(course.finalGrade)}`}>
                        {course.gradeLevel}
                    </p>
                </div>
            </div>

            {/* 成绩组成 */}
            {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200/80">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">成绩组成</h5>
                    <div className="bg-white/60 rounded-lg p-3 space-y-2">
                        {course.components.map(comp => (
                            <div key={comp.name} className="flex justify-between items-center text-sm">
                                <p className="text-gray-700">
                                    {comp.name} <span className="text-xs text-gray-500">({comp.percentage}%)</span>
                                </p>
                                <p className={`font-semibold ${gradeColor(comp.score)}`}>
                                    {comp.score}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 展开/收起按钮 */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex justify-center items-center space-x-1 pt-3 mt-3 text-sm font-medium text-violet-600 hover:text-violet-800"
            >
                <span>{showDetails ? '收起详情' : '查看详情'}</span>
                <ChevronDown size={16} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
        </GlassCard>
    );
};

const GradeExplanationCard = () => (
    <GlassCard className="p-5">
        <div className="flex items-center space-x-2 mb-3">
            <Info size={16} className="text-violet-600" />
            <h4 className="text-base font-semibold text-gray-800">UCL 成绩评级</h4>
        </div>
        <div className="space-y-2">
            <GradeExplanationRow range="70-100" level="一等学位 (Distinction)" color="bg-green-500" />
            <GradeExplanationRow range="60-69" level="二等学位 (Merit)" color="bg-amber-500" />
            <GradeExplanationRow range="50-59" level="及格 (Pass)" color="bg-violet-500" />
            <GradeExplanationRow range="0-49" level="不及格 (Fail)" color="bg-red-500" />
        </div>
    </GlassCard>
);

const GradeExplanationRow = ({ range, level, color }) => (
    <div className="flex items-center space-x-3">
        <span className={`w-2 h-2 rounded-full ${color}`}></span>
        <span className="text-sm font-medium text-gray-700 w-16">{range}</span>
        <span className="text-sm text-gray-600">{level}</span>
    </div>
);


// --- 日历 (Calendar) 组件 ---
// 对应 ParentCalendarView.swift

const ParentCalendarView = ({ setModal }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('day'); // month, week, day

    const calendarOptions = [
        { label: '月', value: 'month', icon: Calendar },
        { label: '周', value: 'week', icon: Calendar },
        { label: '日', value: 'day', icon: Calendar }
    ];
    
    // 模拟数据
    const todayEvents = mockCalendarEvents.filter(e => 
        new Date(e.startTime).toDateString() === selectedDate.toDateString()
    );
    const todayActivities = mockActivities.filter(a =>
        new Date(a.date).toDateString() === selectedDate.toDateString()
    );
    const todayTodos = mockTodoItems.filter(t => 
        t.dueDate && new Date(t.dueDate).toDateString() === selectedDate.toDateString()
    );

    return (
        <div className="p-4 space-y-6">
            <TopControlBar selectedDate={selectedDate} onSettingsTap={() => setModal({ type: 'settings' })} />
            
            <div className="flex justify-center">
                <SegmentedControl
                    options={calendarOptions}
                    selected={viewMode}
                    setSelected={setViewMode}
                    className="max-w-xs"
                />
            </div>

            {/* 日历视图 */}
            <GlassCard className="p-4">
                {viewMode === 'month' && <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={mockCalendarEvents} />}
                {viewMode === 'week' && <WeekView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={mockCalendarEvents} />}
                {viewMode === 'day' && <DayView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={mockCalendarEvents} />}
            </GlassCard>

            {/* 今日概览 */}
            <TodayOverviewCard
                eventCount={todayEvents.length}
                activityCount={todayActivities.length}
                todoCount={todayTodos.length}
            />

            {/* 今日课程 */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">今日课程</h3>
                {todayEvents.length > 0 ? (
                    <div className="space-y-3">
                        {todayEvents.map(event => (
                            <ParentEventCard key={event.id} event={event} onClick={() => setModal({ type: 'eventDetail', data: event })} />
                        ))}
                    </div>
                ) : (
                    <EmptyStateCard icon={Book} message="今天没有安排课程" />
                )}
            </section>
            
            {/* 校园活动 */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">校园活动</h3>
                {todayActivities.length > 0 ? (
                    <div className="space-y-3">
                        {todayActivities.map(activity => (
                            <ParentActivityCard key={activity.id} activity={activity} onClick={() => setModal({ type: 'activityDetail', data: activity })} />
                        ))}
                    </div>
                ) : (
                    <EmptyStateCard icon={Sparkles} message="今天没有校园活动" />
                )}
            </section>
        </div>
    );
};

const TopControlBar = ({ selectedDate, onSettingsTap }) => (
    <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">孩子的日历</h2>
            <p className="text-sm font-medium text-gray-500">
                {formatDate(selectedDate, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
        </div>
        <div className="flex space-x-3">
            <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md shadow-gray-300/30">
                <Bell size={20} className="text-violet-600" />
            </button>
            <button 
                onClick={onSettingsTap}
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md shadow-gray-300/30"
            >
                <Settings size={20} className="text-violet-600" />
            </button>
        </div>
    </div>
);

const MonthView = ({ selectedDate, setSelectedDate, events }) => {
    // ... 此处需要一个完整的日历月份生成逻辑
    // 为保持简洁，我们仅做示意
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
    
    const changeMonth = (amount) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };
    
    // 简化的日期网格
    const simpleDaysGrid = Array.from({ length: 30 }, (_, i) => i + 1);
    
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-violet-600" /></button>
                <h4 className="text-lg font-semibold">
                    {formatDate(currentMonth, { year: 'numeric', month: 'long' })}
                </h4>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20} className="text-violet-600" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {simpleDaysGrid.map(day => {
                    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isSelected = day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth();
                    const dayEvents = events.filter(e => {
                        const eventDate = new Date(e.startTime);
                        return eventDate.getDate() === day && eventDate.getMonth() === currentMonth.getMonth();
                    });
                    
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(dayDate)}
                            className={`h-20 w-full rounded-lg p-1 flex flex-col items-center justify-start ${
                                isSelected ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white ring-2 ring-violet-400' : 'hover:bg-gray-100'
                            }`}
                        >
                            <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {day}
                            </span>
                            {dayEvents.length > 0 && (
                                <div className="mt-1 w-full space-y-0.5 overflow-hidden">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div 
                                            key={event.id} 
                                            className={`text-[9px] leading-tight px-1 py-0.5 rounded ${
                                                isSelected ? 'bg-white/30 text-white' : 'bg-violet-100 text-violet-700'
                                            } truncate`}
                                            title={`${event.course} ${new Date(event.startTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`}
                                        >
                                            {event.course.split(' ')[0]}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className={`text-[9px] font-medium ${isSelected ? 'text-white/80' : 'text-violet-600'}`}>
                                            +{dayEvents.length - 2}更多
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const WeekView = ({ selectedDate, setSelectedDate, events }) => {
    // 生成本周的日期
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });

    return (
        <div className="space-y-3">
            <div className="flex justify-between space-x-1">
                {days.map(day => {
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const dayEvents = events.filter(e => new Date(e.startTime).toDateString() === day.toDateString());
                    
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex-1 flex flex-col items-center space-y-1 p-2 rounded-lg ${
                                isSelected ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-300' : 'hover:bg-gray-100'
                            }`}
                        >
                            <span className="text-xs">{formatDate(day, { weekday: 'short' })}</span>
                            <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                {day.getDate()}
                            </span>
                            {dayEvents.length > 0 && (
                                <div className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-violet-600'}`}>
                                    {dayEvents.length}节课
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* 显示选中日期的课程时间表 */}
            <div className="space-y-2">
                {events
                    .filter(e => new Date(e.startTime).toDateString() === selectedDate.toDateString())
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                    .map(event => {
                        const startTime = new Date(event.startTime);
                        const endTime = new Date(event.endTime);
                        
                        return (
                            <div
                                key={event.id}
                                className="bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{event.course}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{event.lecturer}</p>
                                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {startTime.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})} - 
                                                {endTime.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}
                                            </span>
                                            <span className="flex items-center">
                                                <MapPin size={12} className="mr-1" />
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                                        {event.courseCode}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                {events.filter(e => new Date(e.startTime).toDateString() === selectedDate.toDateString()).length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                        <Book size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">这天没有课程安排</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DayView = ({ selectedDate, setSelectedDate, events }) => {
    const changeDay = (amount) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + amount);
            return newDate;
        });
    };
    
    // 生成8:00-22:00的时间槽
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8);
    
    // 获取当天的课程
    const dayEvents = events.filter(e => new Date(e.startTime).toDateString() === selectedDate.toDateString());

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <button onClick={() => changeDay(-1)} className="p-3 rounded-full hover:bg-violet-100">
                    <ChevronLeft size={22} className="text-violet-600" />
                </button>
                <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{selectedDate.getDate()}</p>
                    <p className="text-sm font-medium text-gray-500">
                        {formatDate(selectedDate, { month: 'long', weekday: 'long' })}
                    </p>
                </div>
                <button onClick={() => changeDay(1)} className="p-3 rounded-full hover:bg-violet-100">
                    <ChevronRight size={22} className="text-violet-600" />
                </button>
            </div>
            
            {/* 时间表 */}
            <div className="relative">
                {timeSlots.map(hour => {
                    const hourStart = new Date(selectedDate);
                    hourStart.setHours(hour, 0, 0, 0);
                    const hourEnd = new Date(selectedDate);
                    hourEnd.setHours(hour + 1, 0, 0, 0);
                    
                    // 查找这个时间段内的课程
                    const hourEvents = dayEvents.filter(event => {
                        const eventStart = new Date(event.startTime);
                        const eventEnd = new Date(event.endTime);
                        return (eventStart >= hourStart && eventStart < hourEnd) || 
                               (eventEnd > hourStart && eventEnd <= hourEnd) ||
                               (eventStart <= hourStart && eventEnd >= hourEnd);
                    });
                    
                    return (
                        <div key={hour} className="flex border-b border-gray-100">
                            <div className="w-16 flex-shrink-0 pr-3 py-3 text-xs text-gray-500 font-medium text-right">
                                {hour}:00
                            </div>
                            <div className="flex-1 py-2 px-2 min-h-[60px] relative">
                                {hourEvents.map(event => {
                                    const eventStart = new Date(event.startTime);
                                    const eventEnd = new Date(event.endTime);
                                    const startMinute = eventStart.getMinutes();
                                    const duration = (eventEnd - eventStart) / (1000 * 60); // 分钟
                                    
                                    return (
                                        <div
                                            key={event.id}
                                            className="mb-1 p-2 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 border-l-4 border-violet-500 hover:shadow-md transition-shadow"
                                        >
                                            <div className="font-semibold text-sm text-gray-900">{event.course}</div>
                                            <div className="text-xs text-gray-600 mt-0.5">{event.courseCode}</div>
                                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock size={10} className="mr-1" />
                                                    {eventStart.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})} - 
                                                    {eventEnd.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}
                                                </span>
                                                <span className="flex items-center">
                                                    <MapPin size={10} className="mr-1" />
                                                    {event.location}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">{event.lecturer}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {dayEvents.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <Book size={40} className="mx-auto mb-3 opacity-50" />
                    <p>今天没有课程安排</p>
                </div>
            )}
        </div>
    );
};


const TodayOverviewCard = ({ eventCount, activityCount, todoCount }) => (
    <div className="grid grid-cols-3 gap-3">
        <OverviewStatCard title="课程" count={eventCount} icon={Book} color="violet" />
        <OverviewStatCard title="活动" count={activityCount} icon={Sparkles} color="violet" />
        <OverviewStatCard title="作业" count={todoCount} icon={CheckSquare} color="green" />
    </div>
);

const OverviewStatCard = ({ title, count, icon: Icon, color }) => {
    const colors = {
        violet: { text: 'text-violet-600', bg: 'bg-violet-100' },
        green: { text: 'text-green-600', bg: 'bg-green-100' },
    };
    
    return (
        <GlassCard className="p-4">
            <div className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full ${colors[color].bg} flex items-center justify-center`}>
                    <Icon size={22} className={colors[color].text} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 text-center">{count}</p>
                    <p className="text-xs font-medium text-gray-500 text-center">{title}</p>
                </div>
            </div>
        </GlassCard>
    );
};

const ParentEventCard = ({ event, onClick }) => (
    <button onClick={onClick} className="w-full text-left">
        <GlassCard className="p-4 flex space-x-4 border border-violet-200/50">
            {/* 时间指示器 */}
            <div className="flex flex-col items-center w-16 text-center flex-shrink-0">
                <span className="text-base font-bold text-violet-600">{formatTime(event.startTime)}</span>
                <div className="w-0.5 h-8 bg-violet-200 my-1"></div>
                <span className="text-xs font-medium text-gray-500">{formatTime(event.endTime)}</span>
            </div>
            
            {/* 内容区域 */}
            <div className="flex-grow min-w-0">
                <h4 className="text-base font-semibold text-gray-900">{event.course}</h4>
                <div className="flex items-center space-x-1.5 text-sm text-gray-600 mt-1">
                    <MapPin size={14} className="text-violet-500" />
                    <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2.5">
                    <span className="text-xs font-medium text-white bg-violet-500 px-2.5 py-0.5 rounded-full">
                        {event.type}
                    </span>
                    {new Date(event.startTime) > new Date() && (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Clock size={12} />
                            <span>即将开始</span>
                        </span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center">
                <ChevronRight size={18} className="text-gray-400" />
            </div>
        </GlassCard>
    </button>
);

const ParentActivityCard = ({ activity, onClick }) => (
    <button onClick={onClick} className="w-full text-left">
        <GlassCard className="p-4 flex space-x-4 border border-indigo-200/50">
            {/* 图标 */}
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Sparkles size={22} className="text-indigo-600" />
                </div>
            </div>
            {/* 内容区域 */}
            <div className="flex-grow min-w-0">
                <h4 className="text-base font-semibold text-gray-900 truncate">{activity.title}</h4>
                <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{activity.startTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span className="truncate">{activity.location}</span>
                    </div>
                </div>
                <div className="mt-2.5">
                    <span className="text-xs font-medium text-white bg-indigo-500 px-2.5 py-0.5 rounded-full">
                        {activity.type}
                    </span>
                </div>
            </div>
            <div className="flex items-center">
                <ChevronRight size={18} className="text-gray-400" />
            </div>
        </GlassCard>
    </button>
);

const EmptyStateCard = ({ icon: Icon, message }) => (
    <GlassCard className="p-10">
        <div className="flex flex-col items-center space-y-3 text-center">
            <Icon size={40} className="text-violet-300" />
            <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
    </GlassCard>
);


// --- 健康 (Health) 组件 ---
// 对应 ParentHealthView.swift

const ParentHealthView = ({ setModal }) => {
    const [range, setRange] = useState('week'); // day, week, month
    const rangeOptions = [
        { label: '今日', value: 'day' },
        { label: '7天', value: 'week' },
        { label: '30天', value: 'month' }
    ];

    const data = mockHealthData[range];

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 px-1">健康</h2>
            
            <SegmentedControl
                options={rangeOptions}
                selected={range}
                setSelected={setRange}
            />
            
            <div className="grid grid-cols-2 gap-4">
                {data.map(item => (
                    <ParentHealthCard 
                        key={item.id} 
                        item={item} 
                        onClick={() => setModal({ type: 'healthDetail', data: item })}
                    />
                ))}
            </div>
            
            <CareSection />
        </div>
    );
};

const ParentHealthCard = ({ item, onClick }) => {
    const Icon = item.icon;
    const colorClass = `text-${item.color}`;
    const bgClass = `bg-${item.color}`;
    const progressBgClass = `bg-${item.color.split('-')[0]}-100`;
    const progressFillClass = `bg-${item.color}`;

    return (
        <GlassCard onClick={onClick} className="p-4 space-y-3 cursor-pointer">
            <div className="flex justify-between items-start">
                <Icon size={24} className={colorClass} />
                <span className={`text-xs font-bold ${colorClass} ${progressBgClass} px-2 py-0.5 rounded-full`}>
                    {item.status}
                </span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
            <div className="flex items-baseline space-x-1">
                <span className={`text-3xl font-bold ${colorClass}`}>{item.value}</span>
                {item.unit && <span className="text-sm font-medium text-gray-500">{item.unit}</span>}
            </div>
            <div className={`w-full ${progressBgClass} rounded-full h-1.5`}>
                <div 
                    className={`${progressFillClass} h-1.5 rounded-full`}
                    style={{ width: `${item.progress * 100}%` }}
                ></div>
            </div>
        </GlassCard>
    );
};

const CareSection = () => (
    <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-3">关怀建议</h3>
        <div className="space-y-3">
            <ParentHealthTipRow icon={MoonStar} color="indigo-500" text="鼓励保持规律作息，避免熬夜" /> {/* Was: MoonStars */}
            <ParentHealthTipRow icon={Footprints} color="green-500" text="一起制定每周运动计划" /> {/* Was: Walk */}
            <ParentHealthTipRow icon={MessageCircle} color="violet-500" text="每周倾听孩子学习与情绪" />
        </div>
    </GlassCard>
);

const ParentHealthTipRow = ({ icon: Icon, color, text }) => {
    const colorClass = `text-${color}`;
    const bgClass = `bg-${color.split('-')[0]}-100`;
    
    return (
        <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={colorClass} />
            </div>
            <p className="text-sm text-gray-700">{text}</p>
        </div>
    );
};


// --- AI 助手 (AI Assistant) 组件 ---
// 对应 ParentAIAssistantView.swift

// Mock AI 对话数据
const mockDemoConversations = [
    { 
        user: 'Zoya 最近的学习状况怎么样？', 
        ai: '📊 Zoya 最近的学习状况很不错！\n\n✅ 本周完成的作业：5/5\n📈 最近成绩：数据科学 87分，统计学 85分\n⏰ 课堂出勤率：100%\n\n她在数据科学课程中表现特别突出，上周的项目获得了老师的表扬。' 
    },
    { 
        user: '她最近有参加什么活动吗？', 
        ai: '🎯 Zoya 最近参加了几项活动：\n\n· 校园科技展览会（上周三）\n· 数学竞赛小组（每周五）\n· 志愿者服务 - 图书馆（本月10小时）\n\n她在科技展览会上展示的项目获得了"最佳创意奖"！' 
    },
    { 
        user: '她和同学相处得怎么样？', 
        ai: '👥 Zoya 的社交情况良好！\n\n· 参与小组项目：4个学习小组\n· 校园好友：15+ 位同学\n· 社交活动：每周参加2-3次课外活动\n\n老师反馈她乐于助人，经常帮助同学解决学习问题。' 
    },
    { 
        user: '她这学期整体目标完成得怎么样？', 
        ai: '🏆 学期目标完成情况：\n\n✅ 保持GPA 3.8以上 - 进行中 (当前3.85)\n✅ 完成3个研究项目 - 已完成2个\n✅ 参加志愿活动20小时 - 已完成15小时\n✅ 阅读10本专业书籍 - 已完成7本\n\n整体进度很好，预计能顺利完成所有目标！' 
    }
];

const ParentAIAssistantView = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [useRealAI, setUseRealAI] = useState(true); // 是否使用真实 AI
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isProcessing]);

    const handleSend = async (text) => {
        if (!text.trim()) return;
        
        const userMessage = { id: Math.random(), text, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsProcessing(true);
        
        try {
            if (useRealAI) {
                // 使用真实的 Google Gemini AI
                const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'AIzaSyDgUvUSKMwc5t4apgrWK--00L0du7S10fU';
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-pro"
                });
                
                // 构建上下文提示
                const context = `你是一位专业的家长助手，帮助家长了解孩子在大学的学习和生活情况。
孩子（Zoya）的信息：
- 在读课程：数据科学与统计 (CHME0007)、健康数据科学原理 (CHME0006)、生物统计学、机器学习
- 最近成绩：数据科学 87分、统计学 85分、生物统计学 82分
- 本周完成作业：5/5
- 课堂出勤率：100%
- 参与活动：校园科技展览会、数学竞赛小组、图书馆志愿者服务
- 获奖情况：科技展览会"最佳创意奖"

请用温和、专业的语气回答家长的问题，让家长感到安心。如果涉及具体数据，请引用上述信息。

家长的问题：${text}`;

                const result = await model.generateContent(context);
                const response = await result.response;
                const aiText = response.text();
                
                const aiMessage = { id: Math.random(), text: aiText, isUser: false };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                // 使用 demo 数据
                const demoResponse = mockDemoConversations.find(c => c.user === text);
                const aiText = demoResponse ? demoResponse.ai : `我理解您的问题: "${text}"\n\n我可以帮您了解：\n· 📊 学业成绩和排名\n· 📋 出勤情况\n· 📝 作业完成度\n\n请告诉我您最想了解的是哪一方面？`;
                
                const aiMessage = { id: Math.random(), text: aiText, isUser: false };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('AI 调用失败:', error);
            // 如果 AI 调用失败，回退到 demo 数据
            const demoResponse = mockDemoConversations.find(c => c.user === text);
            const aiText = demoResponse ? demoResponse.ai : "抱歉，我暂时无法回答这个问题。请稍后再试。";
            
            const aiMessage = { id: Math.random(), text: aiText, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)]"> {/* 减去 Tab bar 高度 */}
            {messages.length === 0 ? (
                <WelcomeScreen onSend={handleSend} />
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-r-2xl rounded-tl-2xl p-3 shadow-md">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
            
            <ChatInputBar
                text={inputText}
                setText={setInputText}
                onSend={() => {
                    handleSend(inputText);
                    setInputText('');
                }}
            />
        </div>
    );
};

const WelcomeScreen = ({ onSend }) => {
    const categories = [
        { icon: '📊', title: '学业情况', desc: '查看孩子的成绩、作业和课堂表现', question: 'Zoya 最近的学习状况怎么样？' },
        { icon: '📅', title: '出勤与活动', desc: '了解出勤记录和参加的校园活动', question: '她最近有参加什么活动吗？' },
        { icon: '👥', title: '社交与生活', desc: '了解与同学相处和校园生活情况', question: '她和同学相处得怎么样？' },
        { icon: '🏆', title: '目标与规划', desc: '查看学期目标完成情况', question: '她这学期整体目标完成得怎么样？' }
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="text-center pt-10">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto">
                    <Sparkles size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">AI 助手</h2>
                <p className="text-sm text-gray-500">了解 Zoya 的学习和生活</p>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800 px-1">我能为您提供什么帮助？</h3>
                {categories.map(cat => (
                    <ParentCategoryButton
                        key={cat.title}
                        icon={cat.icon}
                        title={cat.title}
                        description={cat.desc}
                        onClick={() => onSend(cat.question)}
                    />
                ))}
            </div>
        </div>
    );
};

const ParentCategoryButton = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left">
        <GlassCard className="p-4 flex space-x-4 items-center hover:bg-white transition-all">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="flex-grow min-w-0">
                <h4 className="text-base font-semibold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 truncate">{description}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
        </GlassCard>
    </button>
);

const MessageBubble = ({ message }) => {
    // 使用 React Markdown 来渲染 AI 的回复
    // 为简单起见，这里用 pre-wrap 来保留换行
    return (
        <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs md:max-w-md p-3.5 ${
                    message.isUser
                        ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-l-2xl rounded-tr-2xl'
                        : 'bg-white text-gray-800 rounded-r-2xl rounded-tl-2xl shadow-md'
                }`}
            >
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
            </div>
        </div>
    );
};

const ChatInputBar = ({ text, setText, onSend }) => {
    const handleSend = () => {
        if (text.trim()) onSend();
    };
    
    return (
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="问我关于 Zoya 的任何问题..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                    onClick={handleSend}
                    className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-300 hover:bg-violet-700 transition-all"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};


// --- 邮件 (Mail) 组件 ---
// 对应 ParentEmail.swift (但使用 StudentEmailView.swift 的 UI)

const ParentEmailView = ({ setModal }) => { // 接收 setModal
    const [selectedFilter, setSelectedFilter] = useState('全部');
    const categories = ['全部', '紧急', '学术', '活动'];
    
    const categoryMap = {
        '全部': 'All',
        '紧急': 'Urgent',
        '学术': 'Academic',
        '活动': 'Events'
    };

    const filteredEmails = useMemo(() => {
        const englishFilter = categoryMap[selectedFilter];
        if (englishFilter === 'All') return mockEmails;
        return mockEmails.filter(e => e.category === englishFilter);
    }, [selectedFilter]);
    
    const unreadCount = mockEmails.filter(e => !e.isRead).length;

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            <div className="p-4">
                <h2 className="text-3xl font-bold text-gray-900 px-1">邮件</h2>
            </div>
            
            {/* 统计 */}
            <div className="px-4 mb-4">
                <GlassCard className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Mail size={18} className="text-violet-600" />
                        <span className="text-base font-semibold text-gray-800">未读邮件</span>
                    </div>
                    <span className="text-2xl font-bold text-violet-600">{unreadCount}</span>
                </GlassCard>
            </div>

            {/* 筛选器 */}
            <div className="px-4 pb-3 overflow-x-auto">
                <div className="flex space-x-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                                ${selectedFilter === cat
                                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                    : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300/70'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* 邮件列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredEmails.map(email => (
                    <EmailRow 
                        key={email.id} 
                        email={email} 
                        onClick={() => setModal({ 
                            type: 'emailDetail', 
                            data: {
                                ...email,
                                // 合并详情数据
                                detail: mockEmailDetails[email.sender] || {
                                    original: email.excerpt,
                                    aiTranslation: "AI 翻译不可用。",
                                    aiSummary: ["AI 总结不可用。"]
                                }
                            } 
                        })}
                    />
                ))}
            </div>
        </div>
    );
};

// 新的 EmailRow (基于 StudentEmailView.swift)
const EmailRow = ({ email, onClick }) => {
    const categories = {
        Academic: { icon: Book, color: 'text-violet-600', bgColor: 'bg-violet-100', tagColor: 'bg-violet-500' },
        Events: { icon: PartyPopper, color: 'text-pink-600', bgColor: 'bg-pink-100', tagColor: 'bg-pink-500' },
        Urgent: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100', tagColor: 'bg-amber-500' },
        Default: { icon: Mail, color: 'text-gray-600', bgColor: 'bg-gray-100', tagColor: 'bg-gray-500' }
    };
    
    const cat = categories[email.category] || categories.Default;
    const Icon = cat.icon;

    return (
        <button onClick={onClick} className="w-full text-left">
            <GlassCard className="p-4 flex space-x-4 transition-all hover:bg-white">
                {/* 未读指示条 */}
                {!email.isRead && (
                    <div className="w-1.5 bg-violet-500 rounded-full flex-shrink-0"></div>
                )}
                
                {/* 图标 */}
                <div className={`w-11 h-11 ${cat.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={cat.color} />
                </div>

                {/* 内容 */}
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-sm truncate ${email.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
                            {email.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{email.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <UserCircle size={14} />
                        <span>{email.sender}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{email.excerpt}</p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs font-medium text-white ${cat.tagColor} px-2 py-0.5 rounded`}>
                            {email.category}
                        </span>
                        {!email.isRead && (
                            <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                                未读
                            </span>
                        )}
                    </div>
                </div>
            </GlassCard>
        </button>
    );
};

// 家长端邮件详情模态框
const ParentEmailDetailModal = ({ closeModal, email }) => {
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    
    const detail = email.detail || mockEmailDetails[email.sender] || {
        original: email.excerpt,
        aiTranslation: "AI 翻译不可用。",
        aiSummary: []
    };

    const categories = {
        Academic: { tagColor: 'bg-violet-500', icon: Book },
        Events: { tagColor: 'bg-pink-500', icon: PartyPopper },
        Urgent: { tagColor: 'bg-amber-500', icon: AlertTriangle },
        Default: { tagColor: 'bg-gray-500', icon: Mail }
    };
    
    const cat = categories[email.category] || categories.Default;

    return (
        <ModalWrapper closeModal={closeModal} title="邮件详情">
            <div className="space-y-4">
                {/* 邮件头部 */}
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{email.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <UserCircle size={16} className="text-gray-600" />
                            <span className="font-medium text-gray-700">{email.sender}</span>
                        </div>
                        <span className="text-gray-500">{email.date}</span>
                    </div>
                    <div className="mt-2">
                        <span className={`text-xs font-medium text-white ${cat.tagColor} px-2 py-1 rounded`}>
                            {email.category}
                        </span>
                    </div>
                </div>

                {/* 邮件正文 */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">邮件内容</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{detail.original}</p>
                </div>

                {/* AI 功能按钮 */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`py-3 px-4 rounded-xl font-semibold text-white transition-all ${
                            showTranslation 
                                ? 'bg-green-500 shadow-lg shadow-green-500/30' 
                                : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Languages size={18} />
                            <span>{showTranslation ? '✓ 已翻译' : 'AI 翻译'}</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setShowSummary(!showSummary)}
                        className={`py-3 px-4 rounded-xl font-semibold text-white transition-all ${
                            showSummary 
                                ? 'bg-green-500 shadow-lg shadow-green-500/30' 
                                : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:shadow-lg'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <ListChecks size={18} />
                            <span>{showSummary ? '✓ 已总结' : 'AI 总结'}</span>
                        </div>
                    </button>
                </div>

                {/* AI 翻译内容 */}
                {showTranslation && (
                    <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl animate-in">
                        <div className="flex items-center space-x-2 mb-2">
                            <Check className="text-green-600" size={20} />
                            <h4 className="text-sm font-bold text-green-800">AI 翻译</h4>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{detail.aiTranslation}</p>
                    </div>
                )}

                {/* AI 总结内容 */}
                {showSummary && detail.aiSummary && detail.aiSummary.length > 0 && (
                    <div className="bg-violet-50 border-2 border-violet-200 p-4 rounded-xl animate-in">
                        <div className="flex items-center space-x-2 mb-3">
                            <ListChecks className="text-violet-600" size={20} />
                            <h4 className="text-sm font-bold text-violet-800">AI 总结要点</h4>
                        </div>
                        <ul className="space-y-2">
                            {detail.aiSummary.map((point, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                    <Circle size={6} className="text-violet-500 mt-1.5 flex-shrink-0" fill="currentColor" />
                                    <span className="text-sm text-gray-700">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 添加到日历按钮 */}
                <button 
                    onClick={() => {
                        alert('添加到日历功能：' + email.title);
                        closeModal();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-center space-x-2">
                        <CalendarPlus size={18} />
                        <span>添加到日历</span>
                    </div>
                </button>
            </div>
        </ModalWrapper>
    );
};


// --- 弹窗 (Modals) 组件 ---

// 对应 ParentSettingsView
const ParentSettingsModal = ({ closeModal }) => {
    const [language, setLanguage] = useState('zh');
    const [shareGrades, setShareGrades] = useState(true);
    const [shareCalendar, setShareCalendar] = useState(true);

    return (
        <ModalWrapper closeModal={closeModal} title="设置">
            <div className="space-y-6">
                {/* 语言选择 */}
                <section>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">语言</h4>
                    <div className="bg-white rounded-lg shadow-inner-sm overflow-hidden">
                        <SettingsRowButton title="English" isActive={language === 'en'} onClick={() => setLanguage('en')} />
                        <div className="border-t border-gray-200"></div>
                        <SettingsRowButton title="简体中文" isActive={language === 'zh'} onClick={() => setLanguage('zh')} />
                    </div>
                </section>
                
                {/* 数据共享 */}
                <section>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">数据共享状态</h4>
                    <div className="bg-white rounded-lg shadow-inner-sm p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">学业成绩</span>
                            <span className={`text-sm font-medium ${shareGrades ? 'text-green-600' : 'text-red-500'}`}>
                                {shareGrades ? '已开启' : '已关闭'}
                            </span>
                        </div>
                        <div className="border-t border-gray-200"></div>
                        <div className="flex justify-between items-center pt-3">
                            <span className="text-sm text-gray-700">日历日程</span>
                            <span className={`text-sm font-medium ${shareCalendar ? 'text-green-600' : 'text-red-500'}`}>
                                {shareCalendar ? '已开启' : '已关闭'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center pt-3">
                            数据共享由学生在自己的应用内控制
                        </p>
                    </div>
                </section>
            </div>
        </ModalWrapper>
    );
};

const SettingsRowButton = ({ title, isActive, onClick }) => (
    <button onClick={onClick} className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm text-gray-800">{title}</span>
        {isActive && <Check size={18} className="text-violet-600" />}
    </button>
);

// 对应 ParentHealthDetailView
const ParentHealthDetailModal = ({ closeModal, item }) => {
    const Icon = item.icon;
    const colorClass = `text-${item.color}`;
    const bgClass = `bg-${item.color.split('-')[0]}-100`;
    
    return (
        <ModalWrapper closeModal={closeModal} title={item.title}>
            <div className="space-y-5">
                {/* 概览卡片 */}
                <div className="bg-white rounded-xl shadow-inner-sm p-5">
                    <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={30} className={colorClass} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                            <div className="flex items-baseline space-x-1.5 mt-1">
                                <span className={`text-4xl font-bold ${colorClass}`}>{item.value}</span>
                                {item.unit && <span className="text-base font-medium text-gray-500">{item.unit}</span>}
                            </div>
                            <span className={`text-sm font-medium ${colorClass}`}>{item.status}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{item.note}</p>
                </div>
                
                {/* 趋势图占位 */}
                <div className="bg-white rounded-xl shadow-inner-sm p-5">
                    <h5 className="text-base font-semibold text-gray-800 mb-2">趋势</h5>
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-400">趋势图 (模拟)</span>
                    </div>
                </div>
                
                {/* 建议 */}
                <div className="bg-white rounded-xl shadow-inner-sm p-5">
                    <h5 className="text-base font-semibold text-gray-800 mb-3">建议</h5>
                    <div className="space-y-3">
                        <ParentHealthTipRow icon={UserCheck} color="indigo-500" text="与孩子交流当前学习压力来源" />
                        <ParentHealthTipRow icon={CupSoda} color="amber-500" text="建立晚间放松例行活动" />
                        <ParentHealthTipRow icon={Walk} color="green-500" text="鼓励晨间或课后散步" />
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

// 对应 TodoDetailView
const TodoDetailModal = ({ closeModal, todo }) => {
    const priorityMap = {
        urgent: { text: '紧急', color: 'text-red-600', bg: 'bg-red-100' },
        high: { text: '高', color: 'text-red-500', bg: 'bg-red-100' },
        medium: { text: '中', color: 'text-amber-600', bg: 'bg-amber-100' },
        low: { text: '低', color: 'text-green-600', bg: 'bg-green-100' },
    };
    
    const p = priorityMap[todo.priority] || priorityMap.medium;

    return (
        <ModalWrapper closeModal={closeModal} title="任务详情">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">{todo.title}</h3>
                
                <div className="space-y-2">
                    <DetailRow icon={AlertCircle} label="优先级" value={p.text} valueClass={p.color} />
                    <DetailRow icon={Calendar} label="截止日期" value={todo.dueDate ? formatDate(todo.dueDate) : '无'} />
                    <DetailRow icon={CheckSquare} label="分类" value={todo.category} />
                    <DetailRow icon={Info} label="来源" value={todo.source} />
                </div>
                
                {todo.notes && (
                    <div className="pt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">备注</h5>
                        <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">{todo.notes}</p>
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
};

const DetailRow = ({ icon: Icon, label, value, valueClass = 'text-gray-800' }) => (
    <div className="flex items-center space-x-2 text-sm">
        <Icon size={16} className="text-gray-400" />
        <span className="font-medium text-gray-500 w-20">{label}</span>
        <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
);

// 对应 ParentEventDetailSheet
const ParentEventDetailModal = ({ closeModal, event }) => (
    <ModalWrapper closeModal={closeModal} title={event.type}>
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{event.course}</h3>
            <div className="text-sm text-gray-600 mb-2">{event.courseCode} - {event.lecturer}</div>
            <div className="bg-violet-50 p-4 rounded-lg space-y-3">
                <DetailRow icon={Clock} label="开始时间" value={formatTime(event.startTime)} />
                <DetailRow icon={Clock3} label="结束时间" value={formatTime(event.endTime)} />
                <DetailRow icon={MapPin} label="地点" value={event.location} />
            </div>
            {event.description && (
                <div className="pt-2">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">描述</h5>
                    <p className="text-sm text-gray-600">{event.description}</p>
                </div>
            )}
        </div>
    </ModalWrapper>
);

// --- 新增: 邮件详情弹窗 (基于 EmailDetailView.swift) ---
const EmailDetailModal = ({ closeModal, email }) => {
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    
    const detail = email.detail; // 详情数据已在点击时合并

    return (
        <ModalWrapper closeModal={closeModal} title={email.category}>
            <div className="space-y-5">
                {/* 邮件头部 */}
                <div className="bg-white rounded-lg shadow-inner-sm p-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{email.title}</h3>
                    <div className="space-y-2">
                        <DetailRow icon={Users} label="发件人" value={email.sender} />
                        <DetailRow icon={Calendar} label="日期" value={email.date} />
                    </div>
                </div>

                {/* 邮件原文 */}
                <div className="bg-white rounded-lg shadow-inner-sm p-4">
                    <h4 className="text-base font-semibold text-gray-800 mb-2">邮件内容</h4>
                    <p className="text-sm text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                        {detail.original}
                    </p>
                </div>

                {/* AI 功能按钮 */}
                <div className="grid grid-cols-2 gap-3">
                    <AiButton
                        icon={Languages}
                        text="AI 翻译"
                        activeText="已翻译"
                        isActive={showTranslation}
                        onClick={() => setShowTranslation(!showTranslation)}
                    />
                    <AiButton
                        icon={ListChecks}
                        text="AI 总结"
                        activeText="已总结"
                        isActive={showSummary}
                        onClick={() => setShowSummary(!showSummary)}
                    />
                </div>

                {/* AI 翻译内容 */}
                {showTranslation && (
                    <div className="bg-green-50 rounded-lg p-4 transition-all duration-300">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle size={18} className="text-green-600" />
                            <h4 className="text-base font-semibold text-green-800">AI 翻译</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                            {detail.aiTranslation}
                        </p>
                    </div>
                )}
                
                {/* AI 总结内容 */}
                {showSummary && (
                    <div className="bg-white rounded-lg shadow-inner-sm p-4 transition-all duration-300">
                        <div className="flex items-center space-x-2 mb-3">
                            <ListChecks size={18} className="text-violet-600" />
                            <h4 className="text-base font-semibold text-violet-800">AI 总结要点</h4>
                        </div>
                        <ul className="space-y-2">
                            {detail.aiSummary.map((point, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <span className="text-sm text-gray-700">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* 添加到日历 */}
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-semibold shadow-lg shadow-violet-200 hover:shadow-xl transition-all">
                    <CalendarPlus size={18} />
                    <span>添加到日历</span>
                </button>
            </div>
        </ModalWrapper>
    );
};

// AI 功能按钮
const AiButton = ({ icon: Icon, text, activeText, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300
            ${isActive
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-200 hover:shadow-xl'
            }
        `}
    >
        <Icon size={18} />
        <span>{isActive ? activeText : text}</span>
    </button>
);


// --- 家长设置视图 ---
const ParentSettingsView = ({ onLogout, language, setLanguage, t }) => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [importantAlerts, setImportantAlerts] = useState(true);
    const [dailySummaryTime, setDailySummaryTime] = useState('8:00 AM');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    return (
        <div className="p-4 space-y-5">
            {/* 标题 */}
            <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
            
            {/* 语言选择 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('parent.languageSettings')}</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {[
                        { value: 'zh', label: '简体中文' },
                        { value: 'en', label: 'English' }
                    ].map((lang, index) => (
                        <button
                            key={lang.value}
                            onClick={() => setLanguage(lang.value)}
                            className={`w-full flex items-center justify-between p-4 ${
                                index > 0 ? 'border-t border-gray-100' : ''
                            }`}
                        >
                            <span className="font-medium text-gray-900">{lang.label}</span>
                            {language === lang.value && (
                                <Check className="w-5 h-5 text-violet-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* 数据共享状态 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('parent.dataPrivacy')}</h2>
                <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{t('student.shareGrades')}</span>
                        <span className="text-green-600 font-semibold">{t('parent.completed')}</span>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{t('student.shareSchedule')}</span>
                        <span className="text-green-600 font-semibold">{t('parent.completed')}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-gray-100">
                        数据共享由学生端控制
                    </div>
                </div>
            </div>
            
            {/* 通知设置 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('parent.preferences')}</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="font-medium text-gray-900">{t('parent.emailNotifications')}</span>
                        </div>
                        <button
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`w-12 h-7 rounded-full transition-colors ${
                                emailNotifications ? 'bg-violet-600' : 'bg-gray-300'
                            } relative`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}></div>
                        </button>
                    </div>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="font-medium text-gray-900">{t('parent.pushNotifications')}</span>
                        </div>
                        <button
                            onClick={() => setImportantAlerts(!importantAlerts)}
                            className={`w-12 h-7 rounded-full transition-colors ${
                                importantAlerts ? 'bg-violet-600' : 'bg-gray-300'
                            } relative`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                importantAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}></div>
                        </button>
                    </div>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">每日总结</span>
                        </div>
                        <span className="text-gray-600 font-medium">{dailySummaryTime}</span>
                    </div>
                </div>
            </div>
            
            {/* 退出登录 */}
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors border-2 border-red-200"
            >
                <Lock className="w-5 h-5" />
                <span>{t('student.logout')}</span>
            </button>
            
            {/* 退出确认弹窗 */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-xl font-bold mb-4">确认退出登录？</h3>
                        <p className="text-gray-600 mb-6">退出后需要重新登录才能使用应用</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2 px-4 bg-gray-200 rounded-lg font-medium"
                            >
                                取消
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 主 App 组件 ---

const App = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [modal, setModal] = useState(null); // e.g., { type: 'settings', data: null }
    const { language, setLanguage, t } = useTranslation('zh', 'parent');

    const renderView = () => {
        switch (activeTab) {
            case 'home':
                return <ParentDashboardView setModal={setModal} setActiveTab={setActiveTab} t={t} />;
            case 'academics':
                return <ParentAcademicDetailView t={t} />;
            case 'calendar':
                return <ParentCalendarView setModal={setModal} t={t} />;
            case 'health':
                return <ParentHealthView setModal={setModal} t={t} />;
            case 'ai':
                return <ParentAIAssistantView t={t} />;
            case 'mail':
                return <ParentEmailView setModal={setModal} t={t} />;
            case 'settings':
                return <ParentSettingsView onLogout={onLogout} language={language} setLanguage={setLanguage} t={t} />;
            default:
                return <ParentDashboardView setModal={setModal} setActiveTab={setActiveTab} t={t} />;
        }
    };
    
    const renderModal = () => {
        if (!modal) return null;
        
        switch (modal.type) {
            case 'settings':
                return <ParentSettingsModal closeModal={() => setModal(null)} />;
            case 'healthDetail':
                return <ParentHealthDetailModal closeModal={() => setModal(null)} item={modal.data} />;
            case 'todoDetail':
                return <TodoDetailModal closeModal={() => setModal(null)} todo={modal.data} />;
            case 'eventDetail':
                return <ParentEventDetailModal closeModal={() => setModal(null)} event={modal.data} />;
            case 'activityDetail':
                return <ParentEventDetailModal closeModal={() => setModal(null)} event={modal.data} />; // 复用事件详情
            case 'emailDetail':
                return <ParentEmailDetailModal closeModal={() => setModal(null)} email={modal.data} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gradient-to-b from-slate-50 to-indigo-100 min-h-screen font-sans text-gray-900">
            {/* 主内容区域 */}
            <main className="pb-20"> {/* 底部留出 Tab Bar 空间 */}
                {renderView()}
            </main>
            
            {/* 模拟 Tab Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/80 shadow-t-lg z-40">
                <nav className="flex justify-around max-w-md mx-auto px-2 py-1.5">
                    <TabBarButton
                        icon={Home}
                        label={t('home')}
                        isActive={activeTab === 'home'}
                        onClick={() => setActiveTab('home')}
                    />
                    <TabBarButton
                        icon={GraduationCap}
                        label={t('academics')}
                        isActive={activeTab === 'academics'}
                        onClick={() => setActiveTab('academics')}
                    />
                    <TabBarButton
                        icon={Calendar}
                        label={t('calendar')}
                        isActive={activeTab === 'calendar'}
                        onClick={() => setActiveTab('calendar')}
                    />
                    <TabBarButton
                        icon={Sparkles}
                        label={t('ai')}
                        isActive={activeTab === 'ai'}
                        onClick={() => setActiveTab('ai')}
                    />
                    <TabBarButton
                        icon={Settings}
                        label={t('settings')}
                        isActive={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>
            </footer>
            
            {/* 弹窗 */}
            {renderModal()}
        </div>
    );
};

const TabBarButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-all duration-200
            ${isActive 
                ? 'text-violet-600' 
                : 'text-gray-500 hover:text-violet-500'}
        `}
    >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-xs font-semibold mt-0.5">{label}</span>
    </button>
);

export default App;