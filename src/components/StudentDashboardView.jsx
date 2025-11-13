import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../i18n';
import { 
  getTranslatedCourse, 
  getTranslatedActivity, 
  getTranslatedTodo, 
  getTranslatedEmail,
  getComponentName,
  getCourseNameByCode
} from '../translations/translationUtils';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Heart, 
  BrainCircuit, 
  Mail, 
  User, 
  Settings, 
  Plus, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Users, 
  BookMarked, 
  Info,
  Check,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  BedDouble,
  HeartPulse,
  Footprints,
  FileText,
  ClipboardList,
  CalendarPlus,
  Bell,
  Pill,
  Send,
  ArrowUp,
  MessageCircle,
  Sparkles,
  List,
  Flag,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  ChevronUp,
  FileCheck,
  BarChart2,
  AlertTriangle,
  Star,
  GraduationCap,
  Eye,
  Book,
  PhoneCall,
  Brain,
  Stethoscope,
  ClipboardList as MedicalClipboard
} from 'lucide-react';

// 从统一数据源导入
import { 
  studentInfo,
  courses, 
  todoItems, 
  calendarEvents, 
  activities, 
  emails, 
  emailDetails, 
  healthData,
  allergies
} from '../mockData';

// --- Mock Data ---
// 从 calendarEvents 生成今日课程
const today = new Date();
const mockTodayClasses = calendarEvents
  .filter(e => new Date(e.startTime).toDateString() === today.toDateString())
  .map(e => ({
    id: e.id,
    name: e.course,
    code: e.courseCode,
    // 用浏览器默认语言格式化时间，避免 zh-CN 写死和语法错误
    time: new Date(e.startTime).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
    location: e.location,
  }));

// 将 courses 数据转换为 modules 格式（学生端使用）
const mockModules = [
  ...courses.completed.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    semester: c.semester,
    credit: c.credit,
    mark: c.finalGrade,
    gradeBreakdown: c.components.map(comp => ({
      component: comp.name,
      weight: comp.percentage,
      grade: comp.score
    })),
    assignmentList: [] // 已完成课程没有待办作业
  })),
  ...courses.ongoing.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    semester: '本学期',
    credit: 15,
    mark: 0, // 进行中的课程还没有最终成绩
    gradeBreakdown: [],
    assignmentList: todoItems
      .filter(t => t.course === c.name)
      .map(t => ({
        id: t.id,
        name: t.title,
        dueDate: t.dueDate,
        submitted: t.isCompleted,
        grade: t.isCompleted ? 85 : 0
      }))
  }))
];

// 生成课程表
const mockSchedule = calendarEvents.slice(0, 10).map((e, index) => {
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500'];
  const date = new Date(e.startTime);
  return {
    id: e.id,
    courseId: e.courseCode, // 用 courseCode 来查找翻译
    dayOfWeek: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
    courseName: e.course,
    time: `${date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})} - ${new Date(e.endTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`,
    location: e.location,
    color: colors[index % colors.length]
  };
});

// 使用统一的 calendarEvents
const mockCalendarEvents = calendarEvents;

// 使用统一的 emails
const mockEmails = emails;

// 使用统一的 emailDetails
const mockEmailDetails = emailDetails;

// 使用统一的 todoItems
const mockUpcomingDeadlines = todoItems;

const mockHealthMetrics = healthData;
const mockMedicalRecords = healthData.medicalRecords;
const mockPrescriptions = healthData.prescriptions;
const mockDepartments = healthData.departments;
const mockDoctors = healthData.doctors;

// From StudentAIAssistantView
const demoConversations = {
    "我下周的 deadline 有哪些？": `为您整理了下周的重要截止日期：

**紧急（2天内）**
- CS Assignment - 11月9日 23:59
  - 完成进度：60%，还需完成第三部分

**本周内**
- 数据科学课程论文 - 11月12日
  - 建议：开始文献综述部分
- 健康数据分析报告 - 11月13日
  - 状态：已收集数据，待分析

💡 我注意到您的 CS Assignment 进度稍慢，需要帮您制定完成计划吗？`,
    
    "好的，帮我安排一下": `已为您制定完成计划：

**今天晚上 (3小时)**
- 19:00-22:00 - 完成第三部分代码
- 建议地点：Main Library (开放至23:00)

**明天 (2小时)**
- 14:00-16:00 - 代码测试与调试
- 16:00-17:00 - 撰写文档说明

✅ 已自动添加到您的日历。
⏰ 将在每个时间段前30分钟提醒您。`,
    
    "调取一下，另外我想知道我目前的成绩情况": `已为您准备好实验材料：

📁 Week 7 数据集 → Google Drive/UCL/DataScience/
📧 参考代码 → 已发送到邮箱

---

## 您的成绩分析报告

**总体表现**：一等学位水平 (81.7分)  
**排名**：Top 15% in your cohort

### 各科详情

| 课程 | 成绩 |
|------|------|
| 数据方法与健康研究 | 87分 ⭐ |
| 数据科学与统计 | 72分 |
| 健康数据科学原理 | 67分 |

### 趋势分析

📈 较上月提升 +2.3分  
🎯 如果按时提交下周两份作业，预计总分可达 83-85分`,
    
    "ucl 图书馆几点开门": `UCL 主要有多个图书馆分馆，开放时间各不相同。

📚 例如位于 Wilkins Building 的 **Main Library（主馆）**  
📍 地址：Gower Street, WC1E 6BT

**常规开放时间**：
- 周一至周五：08:30 - 22:00
- 周六：10:00 - 18:00
- 周日：11:00 - 19:00

💡 考试期间会延长开放时间。你想了解哪个具体图书馆的信息呢？`,
    
    "ucl 成立时间": `伦敦大学学院（UCL）成立于 **1826年**。

### 历史亮点
- 🏛️ 原名"伦敦大学"（London University）
- 🌟 英格兰第三古老的大学
- 🎓 英国首个不分宗教信仰接收学生的大学
- �‍🎓 首个接收女性学生的英国大学（1878年）

UCL 今年已经 **199岁** 了！明年就是建校200周年的重要里程碑。`,
    
    "default": `我理解您的问题。我可以帮您：

📚 **查询图书馆信息**
📊 **分析成绩趋势**
📅 **查看课程安排**
📝 **管理作业截止日期**
🎯 **制定学习计划**

请告诉我您最感兴趣的是哪一项？`
};

// --- App Context ---
// Used to manage global state like modals
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [activeModal, setActiveModal] = useState(null); // null, 'addTodo', 'appointmentBooking', 'medicalRecords', { type: 'emailDetail', id: 'e1' }, etc.
    const [todos, setTodos] = useState(mockUpcomingDeadlines);

    const openModal = (modalType, payload = null) => {
        setActiveModal({ type: modalType, payload });
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const addTodo = (todo) => {
        setTodos(prevTodos => [...prevTodos, { ...todo, id: `todo-${Date.now()}` }]);
        closeModal();
    };

    const toggleTodo = (id) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
            )
        );
    };

    return (
        <AppContext.Provider value={{ activeModal, openModal, closeModal, todos, addTodo, toggleTodo }}>
            {children}
        </AppContext.Provider>
    );
};

const useApp = () => useContext(AppContext);

// --- Schedule Context (Dynamic Course Management) ---
const ScheduleContext = createContext();

const generateRepeatSchedules = (schedule, repeatRule, repeatUntil) => {
    const schedules = [schedule];
    
    if (repeatRule === 'none' || !repeatUntil) {
        return schedules;
    }
    
    const startDate = new Date(schedule.startTime);
    const endDate = new Date(schedule.endTime);
    const duration = endDate - startDate;
    let currentDate = new Date(startDate);
    
    while (currentDate < new Date(repeatUntil)) {
        let nextDate;
        
        switch (repeatRule) {
            case 'daily':
                nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'biweekly':
                nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'monthly':
                nextDate = new Date(currentDate);
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            default:
                return schedules;
        }
        
        if (nextDate >= new Date(repeatUntil)) {
            break;
        }
        
        const newEndDate = new Date(nextDate.getTime() + duration);
        schedules.push({
            ...schedule,
            id: `schedule-${Date.now()}-${schedules.length}`,
            startTime: nextDate.toISOString(),
            endTime: newEndDate.toISOString(),
        });
        
        currentDate = nextDate;
    }
    
    return schedules;
};

const ScheduleProvider = ({ children }) => {
    const [schedules, setSchedules] = useState([]);
    
    const addSchedule = (schedule) => {
        const newSchedule = {
            ...schedule,
            id: `schedule-${Date.now()}`,
            startTime: new Date(schedule.startTime).toISOString(),
            endTime: new Date(schedule.endTime).toISOString(),
        };
        
        if (schedule.repeatRule && schedule.repeatRule !== 'none' && schedule.repeatUntil) {
            const generatedSchedules = generateRepeatSchedules(newSchedule, schedule.repeatRule, schedule.repeatUntil);
            setSchedules(prev => [...prev, ...generatedSchedules]);
        } else {
            setSchedules(prev => [...prev, newSchedule]);
        }
    };
    
    const deleteSchedule = (id) => {
        setSchedules(prev => prev.filter(s => s.id !== id));
    };
    
    const updateSchedule = (id, updates) => {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };
    
    const getAllSchedules = () => {
        // 合并 mockCalendarEvents 和动态添加的 schedules
        return [...mockCalendarEvents, ...schedules];
    };
    
    return (
        <ScheduleContext.Provider value={{ schedules, addSchedule, deleteSchedule, updateSchedule, getAllSchedules }}>
            {children}
        </ScheduleContext.Provider>
    );
};

const useSchedule = () => useContext(ScheduleContext);

// --- Helper Components ---

/**
 * Modal component to display sheet-like content
 */
const Modal = ({ children, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-center items-end"
            onClick={onClose}
        >
            <div 
                className="bg-gray-50 dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-t-2xl shadow-xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header Bar */}
                <div className="w-full flex justify-center pt-3 pb-2 bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                    <div className="w-20 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>
                {/* Modal Content */}
                <div className="overflow-y-auto px-4 pb-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Segmented Control
 */
const SegmentedControl = ({ tabs, selected, setSelected }) => {
    return (
        <div className="w-full bg-gray-200/80 dark:bg-gray-700/80 p-1 rounded-lg flex items-center">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setSelected(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300
                        ${selected === tab.id 
                            ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'}
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

/**
 * Circular Progress Gauge
 */
const CircularProgress = ({ value, color = "#6366F1", size = 100, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 0.5s ease-out'
                    }}
                />
            </svg>
        </div>
    );
};

/**
 * Trend Arrow Icon
 */
const TrendIcon = ({ trend }) => {
    switch (trend) {
        case 'up':
            return <ArrowUpRight className="w-4 h-4 text-green-500" />;
        case 'down':
            return <ArrowDownRight className="w-4 h-4 text-red-500" />;
        default:
            return <ArrowRight className="w-4 h-4 text-gray-400" />;
    }
};

/**
 * Priority Chip
 */
const PriorityChip = ({ priority, isSelected, onClick }) => {
    const { language } = useTranslation();
    const styles = {
        high: {
            bg: isSelected ? "bg-red-500" : "bg-red-100 dark:bg-red-900/50",
            text: isSelected ? "text-white" : "text-red-600 dark:text-red-400",
            border: "border-red-500",
        },
        medium: {
            bg: isSelected ? "bg-yellow-500" : "bg-yellow-100 dark:bg-yellow-900/50",
            text: isSelected ? "text-white" : "text-yellow-600 dark:text-yellow-400",
            border: "border-yellow-500",
        },
        low: {
            bg: isSelected ? "bg-green-500" : "bg-green-100 dark:bg-green-900/50",
            text: isSelected ? "text-white" : "text-green-600 dark:text-green-400",
            border: "border-green-500",
        },
    };
    const style = styles[priority] || styles.medium;
    const priorityLabels = {
        high: language === 'en' ? 'High' : '高',
        medium: language === 'en' ? 'Medium' : '中',
        low: language === 'en' ? 'Low' : '低',
    };

    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${style.bg} ${style.text}`}
        >
            <div className="flex items-center justify-center space-x-2">
                <Flag className="w-4 h-4" />
                <span className="font-medium text-sm capitalize">{priorityLabels[priority]}</span>
            </div>
        </button>
    );
};

// --- Modal Components ---

/**
 * Add Schedule Modal - 添加课程/日程
 */
const AddScheduleModal = ({ t }) => {
    const { closeModal } = useApp();
    const { addSchedule } = useSchedule();
    
    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [type, setType] = useState(t ? t('student.course') : "课程");
    const [lecturer, setLecturer] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [startTime, setStartTime] = useState("09:00");
    const [duration, setDuration] = useState(1);
    const [repeatRule, setRepeatRule] = useState("none");
    const [repeatUntil, setRepeatUntil] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    
    const types = t ? [
        t('student.course'), 
        t('student.meeting'), 
        t('student.lab'), 
        t('student.seminar'), 
        t('student.other')
    ] : ["课程", "会议", "实验", "研讨", "其他"];
    const repeatRules = t 
        ? [t('student.none'), t('student.daily'), t('student.weekly'), t('student.biweekly'), t('student.monthly')]
        : ["无", "每天", "每周", "每两周", "每月"];
    const repeatRuleValues = ["none", "daily", "weekly", "biweekly", "monthly"];
    
    const handleSubmit = () => {
        if (!courseName || !startTime || !date) {
            alert(t ? t('student.pleaseFillRequiredFields') : "请填写必填项");
            return;
        }
        
        // 计算结束时间
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
        
        const newSchedule = {
            course: courseName,
            courseCode: courseCode || "",
            type: type,
            lecturer: lecturer || "",
            location: location || "",
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            repeatRule: repeatRule === "none" ? "none" : repeatRule,
            repeatUntil: repeatRule === "none" ? null : repeatUntil,
        };
        
        addSchedule(newSchedule);
        closeModal();
        alert(t ? t('student.scheduleAddedSuccessfully') : "日程添加成功！");
    };
    
    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t ? t('student.addSchedule') : '添加日程'}
            </h2>
            
            {/* 基本信息 */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t ? t('student.basicInformation') : '基本信息'}
                </h3>
                
                {/* 课程名称 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t ? t('student.courseName') : '课程名称'} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder={t ? t('student.courseName').toLowerCase() : "输入课程名称"}
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                    />
                </div>
                
                {/* 课程代码 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.courseCode') : '课程代码'}
                        </label>
                        <input
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder={t ? "e.g., CS101" : "例如: CS101"}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                        />
                    </div>
                    
                    {/* 类型 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.type') : '类型'}
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        >
                            {types.map(typeOption => <option key={typeOption} value={typeOption}>{typeOption}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* 讲师和地点 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.lecturer') : '讲师'}
                        </label>
                        <input
                            type="text"
                            value={lecturer}
                            onChange={(e) => setLecturer(e.target.value)}
                            placeholder={t ? "Enter lecturer name" : "输入讲师名称"}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.location') : '地点'}
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t ? "e.g., Room 101" : "例如: 101教室"}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                        />
                    </div>
                </div>
            </div>
            
            {/* 时间信息 */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t ? t('student.timeInformation') : '时间信息'}
                </h3>
                
                {/* 日期和开始时间 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.date') : '日期'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.startTime') : '开始时间'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                
                {/* 时长 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t ? t('student.duration') : '时长(小时)'}
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="range"
                            min="0.5"
                            max="8"
                            step="0.5"
                            value={duration}
                            onChange={(e) => setDuration(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-16 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-center text-gray-900 dark:text-white font-medium">
                            {duration}h
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t ? `${t('student.endTime')}: ${new Date(new Date(`${date}T${startTime}`).getTime() + duration * 60 * 60 * 1000).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}` : `结束时间: ${new Date(new Date(`${date}T${startTime}`).getTime() + duration * 60 * 60 * 1000).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}`}
                    </p>
                </div>
            </div>
            
            {/* 重复设置 */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {t ? t('student.repeatSettings') : '重复设置'}
                </h3>
                
                {/* 重复规则 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t ? t('student.repeatRule') : '重复规则'}
                    </label>
                    <select
                        value={repeatRule}
                        onChange={(e) => setRepeatRule(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    >
                        {repeatRules.map((rule, idx) => (
                            <option key={rule} value={repeatRuleValues[idx]}>
                                {rule}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* 重复截止日期 */}
                {repeatRule !== "none" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t ? t('student.repeatUntil') : '重复截止日期'}
                        </label>
                        <input
                            type="date"
                            value={repeatUntil}
                            onChange={(e) => setRepeatUntil(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                    </div>
                )}
            </div>
            
            {/* 提交按钮 */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    {t ? t('student.cancel') : '取消'}
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 px-4 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700"
                >
                    {t ? t('student.addSchedule') : '添加日程'}
                </button>
            </div>
        </div>
    );
};

/**
 * Add Todo Modal (from AddTodoView.swift)
 */
const AddTodoModal = () => {
    const { closeModal, addTodo } = useApp();
    const { language } = useTranslation();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(language === 'en' ? "Assignment" : "作业");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 16));
    const [hasDueDate, setHasDueDate] = useState(true);
    const [notes, setNotes] = useState("");

    const categories = language === 'en' 
        ? ["Assignment", "Exam", "Project", "Reading", "Experiment", "Essay", "Other"]
        : ["作业", "考试", "项目", "阅读", "实验", "论文", "其他"];

    const handleSubmit = () => {
        if (!title) {
            console.error(language === 'en' ? "Please enter title" : "请输入标题");
            return;
        }
        addTodo({
            title,
            category,
            priority,
            dueDate: hasDueDate ? new Date(dueDate) : null,
            notes,
            isCompleted: false
        });
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Add Todo' : '添加待办事项'}</h2>

            {/* Title */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                    {language === 'en' ? 'Title' : '标题'} <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'en' ? 'Enter todo title' : '请输入待办事项标题'}
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <BookMarked className="w-4 h-4 mr-2 text-indigo-500" />
                    {language === 'en' ? 'Category' : '分类'}
                </label>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`py-2 px-4 rounded-full text-sm font-medium transition-all
                                ${category === cat 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Flag className="w-4 h-4 mr-2 text-indigo-500" />
                    {language === 'en' ? 'Priority' : '优先级'}
                </label>
                <div className="flex space-x-2">
                    <PriorityChip priority="low" isSelected={priority === 'low'} onClick={() => setPriority('low')} />
                    <PriorityChip priority="medium" isSelected={priority === 'medium'} onClick={() => setPriority('medium')} />
                    <PriorityChip priority="high" isSelected={priority === 'high'} onClick={() => setPriority('high')} />
                </div>
            </div>
            
            {/* Due Date */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                        {language === 'en' ? 'Due Date' : '截止日期'}
                    </label>
                    <input
                        type="checkbox"
                        checked={hasDueDate}
                        onChange={() => setHasDueDate(!hasDueDate)}
                        className="h-4 w-4 text-indigo-600 rounded"
                    />
                </div>
                {hasDueDate && (
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-indigo-500" />
                    {language === 'en' ? 'Notes' : '备注'}
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    placeholder={language === 'en' ? 'Add more details...' : '添加更多详情...'}
                />
            </div>

            {/* Add Button */}
            <button
                onClick={handleSubmit}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-all"
            >
                <Plus className="w-5 h-5" />
                <span>{language === 'en' ? 'Add Todo' : '添加待办事项'}</span>
            </button>
        </div>
    );
};

/**
 * Appointment Booking Modal (from AppointmentBookingView.swift)
 */
const AppointmentBookingModal = () => {
    const { closeModal } = useApp();
    const [step, setStep] = useState(1);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [patientName, setPatientName] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [symptoms, setSymptoms] = useState("");

    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"];

    const canProceed = () => {
        if (step === 1) return selectedDoctor;
        if (step === 2) return selectedTimeSlot;
        if (step === 3) return patientName && patientPhone && symptoms;
        if (step === 4) return true;
        return false;
    };

    const handleNext = () => {
        if (canProceed()) setStep(s => s + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const handleConfirm = () => {
        console.log("预约成功！"); // Replace with better UI
        closeModal();
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">预约面诊</h2>

            {/* Step Indicator */}
            <div className="flex items-center w-full px-4">
                {[1, 2, 3, 4].map((s, index) => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                            `}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                        </div>
                        {index < 3 && (
                            <div className={`flex-1 h-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            <div className="py-4">
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold dark:text-white">1. 选择科室和医生</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">科室</label>
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {mockDepartments.map(dept => (
                                    <button
                                        key={dept.id}
                                        onClick={() => { setSelectedDepartment(dept); setSelectedDoctor(null); }}
                                        className={`flex flex-col items-center p-3 rounded-lg border-2 w-24 flex-shrink-0 ${selectedDepartment?.id === dept.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        <dept.icon className={`w-6 h-6 text-[#${dept.color}]`} />
                                        <span className="text-sm font-medium mt-1 text-gray-800 dark:text-gray-200">{dept.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {selectedDepartment && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">医生</label>
                                <div className="space-y-2">
                                    {mockDoctors.filter(d => d.department === selectedDepartment.name).map(doc => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoctor(doc)}
                                            className={`w-full text-left p-3 rounded-lg border-2 flex justify-between items-center ${selectedDoctor?.id === doc.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{doc.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{doc.title}</span></p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{doc.experience}年经验</p>
                                            </div>
                                            {selectedDoctor?.id === doc.id && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold dark:text-white">2. 选择时间</h3>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTimeSlot(slot)}
                                    className={`py-3 px-2 rounded-lg text-sm font-medium ${selectedTimeSlot === slot ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold dark:text-white">3. 填写信息</h3>
                        <input type="text" placeholder="患者姓名" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
                        <input type="tel" placeholder="联系电话" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
                        <textarea placeholder="症状描述" value={symptoms} onChange={e => setSymptoms(e.target.value)} rows="3" className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
                    </div>
                )}
                {step === 4 && (
                    <div className="space-y-4 text-gray-800 dark:text-gray-200">
                        <h3 className="text-lg font-semibold dark:text-white">4. 确认预约</h3>
                        <p><strong>医生:</strong> {selectedDoctor?.name}</p>
                        <p><strong>科室:</strong> {selectedDepartment?.name}</p>
                        <p><strong>时间:</strong> {selectedDate} {selectedTimeSlot}</p>
                        <p><strong>患者:</strong> {patientName}</p>
                        <p><strong>症状:</strong> {symptoms}</p>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                            <p><strong>温馨提示:</strong></p>
                            <ul className="list-disc list-inside">
                                <li>请提前15分钟到达诊室</li>
                                <li>携带相关病历和检查报告</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg"
                    >
                        上一步
                    </button>
                )}
                {step < 4 ? (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="flex-1 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
                    >
                        下一步
                    </button>
                ) : (
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-lg"
                    >
                        确认预约
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * Medical Records Modal (from MedicalRecordsView.swift)
 */
const MedicalRecordsModal = () => {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">就诊历史</h2>
            <div className="space-y-3">
                {mockMedicalRecords.map(record => (
                    <div key={record.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{record.formattedDate}</span>
                            <span className="py-1 px-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">{record.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{record.doctor} · {record.department}</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{record.diagnosis}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Prescriptions Modal (from PrescriptionsView.swift)
 */
const PrescriptionsModal = () => {
    const { language } = useTranslation();
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Prescriptions' : '处方记录'}</h2>
            <div className="space-y-3">
                {mockPrescriptions.map(p => (
                    <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{p.medicationName} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{p.specification}</span></span>
                            <span className={`py-1 px-3 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {p.status === 'active' ? (language === 'en' ? 'Active' : '使用中') : (language === 'en' ? 'Completed' : '已完成')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{p.dosage}</p>
                        {p.status === 'active' && (
                            <div className="mt-2">
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    <span>{language === 'en' ? 'Remaining' : '剩余'}</span>
                                    <span>{p.remainingQuantity}/{p.totalQuantity}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${(p.remainingQuantity / p.totalQuantity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {p.reminderEnabled && (
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 flex items-center">
                                <Bell className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Reminder' : '提醒'}: {p.reminderTime}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Allergies Modal - 过敏史管理
 */
const AllergiesModal = () => {
    const [selectedAllergy, setSelectedAllergy] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const getSeverityColor = (severity) => {
        switch(severity) {
            case '严重': return '#EF4444';
            case '中度': return '#F59E0B';
            case '轻度': return '#10B981';
            default: return '#6B7280';
        }
    };

    if (showAddForm) {
        return <AddAllergyForm onClose={() => setShowAddForm(false)} />;
    }

    if (selectedAllergy) {
        return <AllergyDetail allergy={selectedAllergy} onClose={() => setSelectedAllergy(null)} />;
    }

    return (
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 pb-3 z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">过敏史管理</h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* 警告提示 */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100">重要提醒</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        就医时请主动告知医生您的过敏史
                    </p>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {allergies.filter(a => a.severity === '严重').length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">严重</div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {allergies.filter(a => a.severity === '中度').length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">中度</div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {allergies.filter(a => a.severity === '轻度').length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">轻度</div>
                </div>
            </div>

            {/* 过敏史列表 */}
            <div className="space-y-3">
                {allergies.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">暂无过敏记录</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">点击右上角 + 添加过敏史</p>
                    </div>
                ) : (
                    allergies.map(allergy => (
                        <button
                            key={allergy.id}
                            onClick={() => setSelectedAllergy(allergy)}
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-left border-l-4 hover:shadow-md transition-all"
                            style={{ borderColor: allergy.severityColor }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5" style={{ color: allergy.severityColor }} />
                                    <h3 className="font-bold text-gray-900 dark:text-white">{allergy.allergen}</h3>
                                </div>
                                <span 
                                    className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                                    style={{ backgroundColor: allergy.severityColor }}
                                >
                                    {allergy.severity}
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                    {allergy.allergyType}
                                </span>
                                <span>•</span>
                                <span>发现于 {new Date(allergy.discoveredDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</span>
                            </div>

                            {allergy.symptoms && allergy.symptoms.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {allergy.symptoms.slice(0, 3).map((symptom, index) => (
                                        <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                            {symptom}
                                        </span>
                                    ))}
                                    {allergy.symptoms.length > 3 && (
                                        <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            +{allergy.symptoms.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * Allergy Detail - 过敏详情
 */
const AllergyDetail = ({ allergy, onClose }) => {
    return (
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">过敏详情</h2>
                <div className="w-9"></div>
            </div>

            {/* 警告横幅 */}
            <div 
                className="p-4 rounded-xl flex items-center space-x-3"
                style={{ backgroundColor: `${allergy.severityColor}15` }}
            >
                <AlertTriangle className="w-8 h-8 flex-shrink-0" style={{ color: allergy.severityColor }} />
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{allergy.allergen}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                            {allergy.allergyType}
                        </span>
                        <span 
                            className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                            style={{ backgroundColor: allergy.severityColor }}
                        >
                            {allergy.severity}
                        </span>
                    </div>
                </div>
            </div>

            {/* 症状 */}
            {allergy.symptoms && allergy.symptoms.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">症状表现</h4>
                    <div className="flex flex-wrap gap-2">
                        {allergy.symptoms.map((symptom, index) => (
                            <span key={index} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                                {symptom}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 详细信息 */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">详细信息</h4>
                
                <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">发现日期</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-auto">
                        {new Date(allergy.discoveredDate).toLocaleDateString('zh-CN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>

                {allergy.notes && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-start space-x-3">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">备注</span>
                                <p className="text-sm text-gray-900 dark:text-white">{allergy.notes}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 安全提示 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">安全提示</h4>
                </div>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• 就医时请主动告知医生此过敏史</li>
                    <li>• 避免接触或使用此过敏原</li>
                    <li>• 如出现严重过敏反应，请立即就医</li>
                </ul>
            </div>
        </div>
    );
};

/**
 * Add Allergy Form - 添加过敏史表单
 */
const AddAllergyForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        allergen: '',
        allergyType: '药物过敏',
        severity: '轻度',
        symptoms: [],
        symptomInput: '',
        discoveredDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const allergyTypes = ['药物过敏', '食物过敏', '环境过敏', '其他'];
    const severityLevels = [
        { value: '轻度', color: '#10B981' },
        { value: '中度', color: '#F59E0B' },
        { value: '严重', color: '#EF4444' }
    ];
    const commonSymptoms = ['皮疹', '瘙痒', '红肿', '呼吸困难', '恶心', '呕吐', '腹泻', '头晕', '心悸', '过敏性休克'];

    const addSymptom = () => {
        if (formData.symptomInput.trim() && !formData.symptoms.includes(formData.symptomInput.trim())) {
            setFormData({
                ...formData,
                symptoms: [...formData.symptoms, formData.symptomInput.trim()],
                symptomInput: ''
            });
        }
    };

    const removeSymptom = (symptom) => {
        setFormData({
            ...formData,
            symptoms: formData.symptoms.filter(s => s !== symptom)
        });
    };

    const toggleCommonSymptom = (symptom) => {
        if (formData.symptoms.includes(symptom)) {
            removeSymptom(symptom);
        } else {
            setFormData({ ...formData, symptoms: [...formData.symptoms, symptom] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 这里应该调用API保存数据
        console.log('保存过敏史:', formData);
        alert('过敏史已添加（演示模式）');
        onClose();
    };

    return (
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 pb-3 z-10">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">添加过敏史</h2>
                <div className="w-9"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 过敏原信息 */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">过敏原信息</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            过敏原名称 *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.allergen}
                            onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="例如: 青霉素、花粉、海鲜等"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            过敏类型
                        </label>
                        <select
                            value={formData.allergyType}
                            onChange={(e) => setFormData({ ...formData, allergyType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {allergyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            严重程度
                        </label>
                        <div className="flex gap-2">
                            {severityLevels.map(level => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, severity: level.value })}
                                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                                        formData.severity === level.value
                                            ? 'border-current text-white'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}
                                    style={formData.severity === level.value ? { backgroundColor: level.color, borderColor: level.color } : {}}
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: level.color }}
                                        ></div>
                                        <span className="text-sm font-medium">{level.value}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 症状 */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">症状表现</h3>
                    
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={formData.symptomInput}
                            onChange={(e) => setFormData({ ...formData, symptomInput: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="添加症状"
                        />
                        <button
                            type="button"
                            onClick={addSymptom}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            添加
                        </button>
                    </div>

                    {formData.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.symptoms.map(symptom => (
                                <span key={symptom} className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-lg">
                                    <span className="text-sm">{symptom}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSymptom(symptom)}
                                        className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">常见症状（点击快速添加）</p>
                        <div className="flex flex-wrap gap-2">
                            {commonSymptoms.map(symptom => (
                                <button
                                    key={symptom}
                                    type="button"
                                    onClick={() => toggleCommonSymptom(symptom)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                        formData.symptoms.includes(symptom)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {symptom}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 其他信息 */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">其他信息</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            发现日期
                        </label>
                        <input
                            type="date"
                            value={formData.discoveredDate}
                            onChange={(e) => setFormData({ ...formData, discoveredDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            备注
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            placeholder="其他需要说明的信息..."
                        />
                    </div>
                </div>

                {/* 提交按钮 */}
                <button
                    type="submit"
                    disabled={!formData.allergen}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    保存过敏史
                </button>
            </form>
        </div>
    );
};

/**
 * Email Detail Modal (from StudentEmailView.swift)
 */
const EmailDetailModal = ({ emailId }) => {
    const { language } = useTranslation();
    const email = mockEmails.find(e => e.id === emailId);
    const translatedEmail = email ? getTranslatedEmail(email, language) : null;
    const detail = mockEmailDetails[email?.sender] || { original: email?.excerpt, aiTranslation: email?.excerpt, aiSummary: [] };
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    if (!email) return <div className="p-4 text-gray-900 dark:text-white">{language === 'en' ? 'Email not found' : '邮件未找到'}</div>;

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translatedEmail.title}</h2>
            <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{language === 'en' ? 'From' : '发件人'}: {translatedEmail.sender}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Time' : '时间'}: {email.date}</p>
            </div>
            
            {/* Original Content */}
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{language === 'en' ? 'Email Content' : '邮件内容'}</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{detail.original}</p>
            </div>

            {/* AI Buttons */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${showTranslation ? 'bg-green-600' : 'bg-indigo-600'}`}
                >
                    {showTranslation ? (language === 'en' ? 'Translated' : '已翻译') : (language === 'en' ? 'AI Translate' : 'AI 翻译')}
                </button>
                <button
                    onClick={() => setShowSummary(!showSummary)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${showSummary ? 'bg-green-600' : 'bg-indigo-600'}`}
                >
                    {showSummary ? (language === 'en' ? 'Summarized' : '已总结') : (language === 'en' ? 'AI Summary' : 'AI 总结')}
                </button>
            </div>

            {/* AI Content */}
            {showTranslation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{language === 'en' ? 'AI Translation' : 'AI 翻译'}</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{detail.aiTranslation}</p>
                </div>
            )}
            {showSummary && detail.aiSummary.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">{language === 'en' ? 'AI Summary' : 'AI 总结'}</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {detail.aiSummary.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

/**
 * Module Detail Modal (from StudentAcademicsView.swift)
 */
const ModuleDetailModal = ({ moduleId }) => {
    const { language } = useTranslation();
    const module = mockModules.find(m => m.id === moduleId);
    if (!module) return <div className="p-4 text-gray-900 dark:text-white">{language === 'en' ? 'Course not found' : '课程未找到'}</div>;

    const markColor = (mark) => {
        if (mark >= 80) return "text-green-600 dark:text-green-400";
        if (mark >= 70) return "text-purple-600 dark:text-purple-400";
        if (mark >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{module.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-3">{module.code}</p>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{t ? t('student.totalScore') : '总成绩'}</span>
                    <span className={`text-4xl font-bold ${markColor(module.mark)}`}>{module.mark > 0 ? module.mark : 'N/A'}</span>
                </div>
            </div>

            {module.gradeBreakdown.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t ? t('student.gradeBreakdown') : '成绩构成'}</h3>
                    {module.gradeBreakdown.map(item => (
                        <div key={item.component}>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                                <span>{item.component} ({item.weight}%)</span>
                                <span>{item.grade}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${item.grade}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {module.assignmentList.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t ? t('student.assignmentList') : '作业列表'}</h3>
                    {module.assignmentList.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                {item.submitted ? 
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : 
                                    <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                                }
                                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                            </div>
                            <span className={`font-medium ${item.submitted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {item.submitted ? `${item.grade}/100` : `${language === 'en' ? 'Due' : '截止'}: ${item.dueDate}`}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Page Components ---

/**
 * Page: Dashboard (from StudentDashboardView.swift)
 */
const Dashboard = ({ t }) => {
    const { openModal, todos } = useApp();
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t ? t('student.welcome') : '欢迎'}, Zoya</h1>
                <p className="text-base text-gray-600 dark:text-gray-400">{t ? `${t('student.mscHealthDataScience')} · ${t('student.year1')}` : '健康数据科学硕士 · 一年级'}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard title={t ? t('student.upcomingEvents') : '即将截止'} value={todos.filter(t => !t.isCompleted).length} icon={Clock} color="text-yellow-500" />
                <StatCard title={t ? t('student.today') : '今日课程'} value={mockTodayClasses.length} icon={BookOpen} color="text-indigo-500" />
                <StatCard title={t ? t('student.todos') : '待办'} value={todos.filter(t => !t.isCompleted).length} icon={CheckCircle} color="text-green-500" />
            </div>

            {/* Today's Classes */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">📚 {t ? t('student.today') : '今日课程'}</h2>
                    <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t ? t('parent.viewAllActivities') : '查看全部'}</button>
                </div>
                {mockTodayClasses.length > 0 ? (
                    <div className="space-y-3">
                        {mockTodayClasses.map(item => <TodayClassCard key={item.id} item={item} />)}
                    </div>
                ) : (
                    <EmptyStateCard icon={Check} message={t ? t('student.noClassesToday') : "今天没有课程，好好利用这段时间！"} />
                )}
            </div>
            
            {/* Upcoming Deadlines */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">⏰ {t ? t('student.upcomingEvents') : '即将截止'}</h2>
                    <button onClick={() => openModal('addTodo')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> {t ? 'Add' : '添加'}
                    </button>
                </div>
                {todos.filter(t => !t.isCompleted).length > 0 ? (
                    <div className="space-y-3">
                        {todos.filter(t => !t.isCompleted).slice(0, 3).map(todo => 
                            <DeadlineCard key={todo.id} todo={todo} onClick={() => console.log('Open todo detail')} />
                        )}
                    </div>
                ) : (
                    <EmptyStateCard icon={Check} message={t ? "All tasks completed!" : "暂无待办事项，所有任务都已完成！"} />
                )}
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-2 gap-4">
                <QuickAccessCard 
                    title={t ? t('email') : '邮件'}
                    subtitle={`${mockEmails.filter(e => !e.isRead).length} ${t ? 'unread' : '未读'}`}
                    icon={Mail}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    onClick={() => openModal('emailList')}
                />
                <QuickAccessCard 
                    title={t ? t('activities') : '活动'}
                    subtitle={`${activities.length} ${t ? 'events' : '个活动'}`}
                    icon={Sparkles}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    onClick={() => openModal('activitiesList')}
                />
                <QuickAccessCard 
                    title={t ? t('health') : '健康'}
                    subtitle={t ? 'View metrics' : '查看数据'}
                    icon={Heart}
                    color="bg-gradient-to-br from-pink-500 to-rose-500"
                    onClick={() => openModal('healthSummary')}
                />
                <QuickAccessCard 
                    title={t ? t('calendar') : '日历'}
                    subtitle={t ? 'Full schedule' : '完整日程'}
                    icon={CalendarIcon}
                    color="bg-gradient-to-br from-indigo-500 to-violet-600"
                    onClick={() => setSelectedTab('calendar')}
                />
            </div>
            
            {/* Recommendations */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">✨ {t ? 'Recommended' : '为你推荐'}</h2>
                <RecommendationCard 
                    title="数据科学研讨会"
                    type="学术"
                    date="11月15日"
                    location="Online"
                    icon={GraduationCap}
                    color="text-indigo-500"
                />
            </div>
        </div>
    );
};

// Dashboard Sub-components
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <Icon className={`w-6 h-6 ${color} mb-2`} />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
    </div>
);

const TodayClassCard = ({ item }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex space-x-4">
        <div className="flex flex-col items-center justify-center w-16">
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{item.time.split(' - ')[0]}</span>
            <div className="h-6 w-0.5 bg-gray-200 dark:bg-gray-700 my-1"></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.time.split(' - ')[1]}</span>
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.code}</p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="w-3 h-3 mr-1.5" />
                <span>{item.location}</span>
            </div>
        </div>
    </div>
);

const DeadlineCard = ({ todo, onClick }) => {
    const timeRemaining = todo.dueDate ? 
        `${Math.ceil((todo.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}天后` 
        : "无截止时间";
    const colorStyles = {
        high: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500' },
        medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400', icon: 'text-yellow-500' },
        low: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500' },
    };
    const style = colorStyles[todo.priority] || colorStyles.medium;

    return (
        <button onClick={onClick} className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center space-x-4 text-left">
            <div className={`p-3 rounded-full ${style.bg}`}>
                <Clock className={`w-5 h-5 ${style.icon}`} />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{todo.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{todo.category}</p>
            </div>
            <span className={`text-sm font-medium ${style.text}`}>{timeRemaining}</span>
        </button>
    );
};

const QuickAccessCard = ({ title, subtitle, icon: Icon, color, onClick }) => (
    <button 
        onClick={onClick}
        className="group relative p-5 bg-white dark:bg-gray-800 rounded-3xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-start transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
    >
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
        
        {/* Icon with colored background */}
        <div className={`${color} p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity" style={{ color: color.includes('blue') ? '#3B82F6' : color.includes('purple') ? '#A855F7' : color.includes('pink') ? '#EC4899' : '#6366F1' }}></div>
    </button>
);

const RecommendationCard = ({ title, type, date, location, icon: Icon, color }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{type} · {date} · {location}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
);

const EmptyStateCard = ({ icon: Icon, message }) => (
    <div className="p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full">
            <Icon className="w-8 h-8 text-green-500" />
        </div>
        <p className="mt-4 text-base font-medium text-gray-600 dark:text-gray-300">{message}</p>
    </div>
);


/**
 * Page: Academics (from StudentAcademicsView.swift)
 */
const Academics = ({ t }) => {
    const { openModal } = useApp();
    const { language } = useTranslation();
    const [selectedTab, setSelectedTab] = useState("modules");
    const tabs = [
        { id: "modules", label: t('student.courses') },
        { id: "schedule", label: language === 'en' ? 'Schedule' : '课程表' }
    ];
    
    const validModules = mockModules.filter(m => m.mark > 0);
    const overallAverage = validModules.length > 0 ? validModules.reduce((acc, m) => acc + m.mark, 0) / validModules.length : 0;

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('student.academics')}</h1>
            <SegmentedControl tabs={tabs} selected={selectedTab} setSelected={setSelectedTab} />

            {selectedTab === "modules" && (
                <div className="space-y-6">
                    {/* Overall Average */}
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center space-x-6">
                        <div className="relative">
                            <CircularProgress value={overallAverage} size={120} strokeWidth={12} color="#8B5CF6" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{overallAverage.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <span className="py-1 px-3 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                {language === 'en' ? 'First Class Honours' : '一等学位'}
                            </span>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">{language === 'en' ? 'Overall Average' : '总平均分'}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Excellent - First Class Level!' : '优秀 - 一等学位水平!'}</p>
                        </div>
                    </div>
                    
                    {/* Modules List */}
                    <div className="space-y-3">
                        {mockModules.map(module => (
                            <ModuleCard key={module.id} module={module} onClick={() => openModal('moduleDetail', module.id)} language={language} />
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === "schedule" && (
                <div className="space-y-3">
                    {mockSchedule.map(item => <ScheduleCard key={item.id} item={item} language={language} />)}
                </div>
            )}
        </div>
    );
};

// Academics Sub-components
const ModuleCard = ({ module, onClick, language }) => {
    const translatedModule = getTranslatedCourse(module, language);
    const markColor = (mark) => {
        if (mark >= 80) return "text-green-600 dark:text-green-400";
        if (mark >= 70) return "text-purple-600 dark:text-purple-400";
        if (mark >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };
    
    return (
        <button onClick={onClick} className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-left">
            <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{translatedModule.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{translatedModule.code}</p>
                </div>
                <div className="flex flex-col items-end">
                    {module.mark > 0 ? (
                        <span className={`text-2xl font-bold ${markColor(module.mark)}`}>{module.mark}</span>
                    ) : (
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{language === 'en' ? 'In Progress' : '进行中'}</span>
                    )}
                </div>
            </div>
            {module.mark > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                    <div 
                        className={`h-1.5 rounded-full ${markColor(module.mark).replace('text-','bg-')}`}
                        style={{ width: `${module.mark}%` }}
                    ></div>
                </div>
            )}
        </button>
    );
};

const ScheduleCard = ({ item, language }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex space-x-4">
        <div className={`w-14 h-14 ${item.color} rounded-lg flex flex-col items-center justify-center flex-shrink-0`}>
            <span className="text-sm font-bold text-white">{item.dayOfWeek}</span>
        </div>
        <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{getCourseNameByCode(item.courseId, language)}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.location}</p>
        </div>
    </div>
);


// Calendar View Components (similar to parent view)
const StudentMonthView = ({ selectedDate, setSelectedDate, events }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
    
    const changeMonth = (amount) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };
    
    const simpleDaysGrid = Array.from({ length: 30 }, (_, i) => i + 1);
    
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeft size={20} className="text-violet-600 dark:text-violet-400" />
                </button>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                </h4>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronRight size={20} className="text-violet-600 dark:text-violet-400" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
                                isSelected ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white ring-2 ring-violet-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {day}
                            </span>
                            {dayEvents.length > 0 && (
                                <div className="mt-1 w-full space-y-0.5 overflow-hidden">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div 
                                            key={event.id} 
                                            className={`text-[9px] leading-tight px-1 py-0.5 rounded ${
                                                isSelected ? 'bg-white/30 text-white' : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200'
                                            } truncate`}
                                            title={`${event.course} ${new Date(event.startTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`}
                                        >
                                            {event.courseCode}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className={`text-[9px] font-medium ${isSelected ? 'text-white/80' : 'text-violet-600 dark:text-violet-400'}`}>
                                            +{dayEvents.length - 2}
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

const StudentWeekView = ({ selectedDate, setSelectedDate, events }) => {
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
                                isSelected ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span className="text-xs">{day.toLocaleDateString('zh-CN', { weekday: 'short' })}</span>
                            <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                                {day.getDate()}
                            </span>
                            {dayEvents.length > 0 && (
                                <div className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-violet-600 dark:text-violet-400'}`}>
                                    {dayEvents.length}节课
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            
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
                                className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/50 border-l-4 border-violet-500 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{event.course}</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{event.lecturer}</p>
                                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
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
                                    <div className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200 rounded text-xs font-medium">
                                        {event.courseCode}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                {events.filter(e => new Date(e.startTime).toDateString() === selectedDate.toDateString()).length === 0 && (
                    <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                        <Book size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">这天没有课程安排</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentDayView = ({ selectedDate, setSelectedDate, events }) => {
    const changeDay = (amount) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + amount);
            return newDate;
        });
    };
    
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8);
    const dayEvents = events.filter(e => new Date(e.startTime).toDateString() === selectedDate.toDateString());

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <button onClick={() => changeDay(-1)} className="p-3 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900">
                    <ChevronLeft size={22} className="text-violet-600 dark:text-violet-400" />
                </button>
                <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{selectedDate.getDate()}</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {selectedDate.toLocaleDateString('zh-CN', { month: 'long', weekday: 'long' })}
                    </p>
                </div>
                <button onClick={() => changeDay(1)} className="p-3 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900">
                    <ChevronRight size={22} className="text-violet-600 dark:text-violet-400" />
                </button>
            </div>
            
            <div className="relative">
                {timeSlots.map(hour => {
                    const hourStart = new Date(selectedDate);
                    hourStart.setHours(hour, 0, 0, 0);
                    const hourEnd = new Date(selectedDate);
                    hourEnd.setHours(hour + 1, 0, 0, 0);
                    
                    const hourEvents = dayEvents.filter(event => {
                        const eventStart = new Date(event.startTime);
                        const eventEnd = new Date(event.endTime);
                        return (eventStart >= hourStart && eventStart < hourEnd) || 
                               (eventEnd > hourStart && eventEnd <= hourEnd) ||
                               (eventStart <= hourStart && eventEnd >= hourEnd);
                    });
                    
                    return (
                        <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700">
                            <div className="w-16 flex-shrink-0 pr-3 py-3 text-xs text-gray-500 dark:text-gray-400 font-medium text-right">
                                {hour}:00
                            </div>
                            <div className="flex-1 py-2 px-2 min-h-[60px] relative">
                                {hourEvents.map(event => {
                                    const eventStart = new Date(event.startTime);
                                    const eventEnd = new Date(event.endTime);
                                    
                                    return (
                                        <div
                                            key={event.id}
                                            className="mb-1 p-2 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 border-l-4 border-violet-500 hover:shadow-md transition-shadow"
                                        >
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white">{event.course}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{event.courseCode}</div>
                                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{event.lecturer}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {dayEvents.length === 0 && (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                    <Book size={40} className="mx-auto mb-3 opacity-50" />
                    <p>今天没有课程安排</p>
                </div>
            )}
        </div>
    );
};

/**
 * Page: Calendar (from StudentCalendarView.swift)
 */
const CalendarPage = ({ t }) => {
    const { language } = useTranslation();
    const { openModal } = useApp();
    const { getAllSchedules } = useSchedule();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState("day");
    
    const tabs = [
        { id: "day", label: language === 'en' ? 'Day' : '日' },
        { id: "week", label: language === 'en' ? 'Week' : '周' },
        { id: "month", label: language === 'en' ? 'Month' : '月' },
    ];
    
    // 获取所有日程（包括动态添加的）
    const allEvents = getAllSchedules();
    const todayEvents = allEvents.filter(e => 
        new Date(e.startTime).toDateString() === selectedDate.toDateString()
    );
    
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Calendar' : '日历'}</h1>
                <button 
                    onClick={() => openModal('addSchedule')}
                    className="p-2 bg-violet-600 text-white rounded-full shadow hover:bg-violet-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <SegmentedControl tabs={tabs} selected={viewMode} setSelected={setViewMode} />
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                {viewMode === 'month' && <StudentMonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={allEvents} />}
                {viewMode === 'week' && <StudentWeekView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={allEvents} />}
                {viewMode === 'day' && <StudentDayView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={allEvents} />}
            </div>
            
            {viewMode !== 'week' && (
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Today\'s Schedule' : '今日日程'}</h3>
                    {todayEvents.length > 0 ? (
                        todayEvents.map(event => (
                            <ModernEventCard 
                                key={event.id}
                                event={{ 
                                    title: event.course, 
                                    courseCode: event.courseCode,
                                    lecturer: event.lecturer,
                                    location: event.location, 
                                    startTime: new Date(event.startTime).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}), 
                                    endTime: new Date(event.endTime).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}), 
                                    type: event.type 
                                }}
                            />
                        ))
                    ) : (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-center text-gray-400 dark:text-gray-500">
                            <Book size={32} className="mx-auto mb-2 opacity-50" />
                            <p>{language === 'en' ? 'No classes scheduled for today' : '今天没有课程安排'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Calendar Sub-components
const ModernEventCard = ({ event }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex space-x-3">
        <div className="flex flex-col items-center w-16 text-center flex-shrink-0">
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{event.startTime}</span>
            <div className="h-6 w-0.5 bg-gray-200 dark:bg-gray-700 my-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{event.endTime}</span>
        </div>
        <div className="flex-1 overflow-hidden">
            <div className="flex items-center space-x-2 mb-1">
                <span className={`py-0.5 px-2 text-xs font-medium rounded-full ${event.type === '课程' ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'}`}>
                    {event.type}
                </span>
                {event.courseCode && (
                    <span className="py-0.5 px-2 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {event.courseCode}
                    </span>
                )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{event.title}</h3>
            {event.lecturer && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{event.lecturer}</p>
            )}
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={12} className="text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{event.location}</p>
            </div>
        </div>
    </div>
);


/**
 * Health (from StudentHealthView.swift) - 简化版：只展示几个核心健康功能
 */
// --- Health (学生端健康页面) ---

const Health = ({ t }) => {
    const { openModal } = useApp();

    return (
        <div className="space-y-6">
            {/* 标题 */}
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-indigo-500 font-semibold">
                    {t ? t('student.health') : "健康"}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t ? t('student.campusHealthServices') : "校园健康服务"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t ? "One-tap consult, on-campus appointments, and your health reports in one place." : "一键问诊、预约面诊和个人健康报告，都在这里统一管理。"}
                </p>
            </div>

            {/* 一键问诊 */}
            <QuickActionCard
                icon={PhoneCall}
                title={t ? t('student.oneTapConsult') : "一键问诊"}
                description={
                    t ? "Students can contact our remote medical team at any time. After submitting symptoms, a doctor will reply within 15 minutes via text / phone / video." : "学生可以随时发起远程医疗咨询。提交症状后，医生团队会在 15 分钟内通过文字 / 电话 / 视频进行回复。"
                }
                buttonText={t ? t('student.contactRemoteDoctor') : "联系远程医生"}
                onClick={() => openModal("appointmentBooking")}
            />

            {/* 预约面诊：四个大项 */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t ? t('student.bookOnSiteVisit') : "预约面诊"}
                    </h2>
                    <button
                        type="button"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => openModal("appointmentBooking")}
                    >
                        {t ? t('student.bookNow') : "立即预约"}
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t ? "Select from major services below. You'll be matched with the right doctor team." : "按需选择以下大项服务，我们会为你匹配合适的校医院 / 专家团队。"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AppointmentOptionCard
                        icon={Brain}
                        title={t ? t('student.psychologicalAssessment') : "心理评估"}
                        description={
                            t ? "Emotional support, stress management and basic mental health screening." : "情绪支持、压力管理与基础心理健康评估。"
                        }
                        onClick={() => openModal("appointmentBooking")}
                    />
                    <AppointmentOptionCard
                        icon={Sparkles}
                        title={t ? t('student.allergyTesting') : "过敏检测"}
                        description={
                            t ? "Food / respiratory allergy screening with doctor explanation." : "呼吸道 / 食物过敏筛查，并提供医学解释。"
                        }
                        onClick={() => openModal("allergies")}
                    />
                    <AppointmentOptionCard
                        icon={Stethoscope}
                        title={t ? t('student.physicalCheckUp') : "身体检查"}
                        description={
                            t ? "Basic physical exam and sports-safety check for students." : "基础体检 + 运动安全评估，适合长期伏案或运动量大的学生。"
                        }
                        onClick={() => openModal("appointmentBooking")}
                    />
                    <AppointmentOptionCard
                        icon={MedicalClipboard}
                        title={t ? t('student.generalConsultation') : "综合问诊"}
                        description={
                            t ? "Multi-disciplinary consultation for complex or long-term conditions." : "多学科联合评估，适合症状复杂或长期反复的情况。"
                        }
                        onClick={() => openModal("appointmentBooking")}
                    />
                </div>
            </div>

            {/* 我的报告 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t ? t('student.myReports') : "我的报告"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t ? "View your visit history and prescriptions. Future lab / imaging reports can also be linked here." : "查看就诊记录和处方记录，之后也可以接入体检报告、影像报告等。"}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <ReportCard
                        title={t ? t('student.visitHistory') : "就诊历史"}
                        count={mockHealthData.medicalRecords.length}
                        onClick={() => openModal("medicalRecords")}
                    />
                    <ReportCard
                        title={t ? t('student.prescriptions') : "处方记录"}
                        count={mockHealthData.prescriptions.length}
                        onClick={() => openModal("prescriptions")}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * 一键问诊卡片
 */
const QuickActionCard = ({ icon: Icon, title, description, buttonText, onClick }) => (
  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <p className="mt-2 text-xs sm:text-sm opacity-90 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onClick}
      className="mt-4 inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/30 text-xs font-medium backdrop-blur hover:bg-white/20 transition"
    >
      {buttonText}
      <ChevronRight className="w-4 h-4 ml-1" />
    </button>
  </div>
);

/**
 * 预约选项卡片：心理评估 / 过敏检测 / 身体检查 / 综合问诊
 */
const AppointmentOptionCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-400 hover:shadow-md transition"
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Icon className="w-6 h-6 text-indigo-500" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  </button>
);

const ReportCard = ({ title, count, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-400 hover:shadow-md transition"
    >
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {`记录数：${count}`}
                </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-indigo-600">
                <span>查看详情</span>
                <ChevronRight className="w-4 h-4" />
            </div>
        </div>
    </button>
);


/**
 * Page: AI Assistant (from StudentAIAssistantView.swift)
 */
const AIAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiKeyError, setApiKeyError] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (prompt) => {
        if (!prompt || isProcessing) return;
        
        const userMessage = { id: Date.now(), text: prompt, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsProcessing(true);
        setApiKeyError(false);

        try {
            // 使用真实的 Google Gemini AI
            const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
            
            console.log('🔑 API Key 状态:', {
                exists: !!apiKey,
                length: apiKey?.length || 0,
                firstChars: apiKey?.substring(0, 10) || 'undefined',
                allEnvVars: Object.keys(import.meta.env)
            });
            
            if (!apiKey || apiKey.startsWith('your_')) {
                throw new Error('Google AI API Key 未配置。请在 .env 文件中设置 VITE_GOOGLE_AI_API_KEY');
            }
            
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash"
            });
            
            // 构建上下文提示
            const context = `你是一位专业的大学学业助手，帮助学生管理课程、作业和学习计划。
学生的当前信息：
- 在读课程：数据科学与统计 (CHME0007)、健康数据科学原理 (CHME0006)、数据方法与健康研究 (CHME0013)
- 最近作业：CS Assignment (2天后截止)、数据科学论文 (5天后截止)
- 最近成绩：数据方法与健康研究 87分、生物统计学 82分

请用友好、专业的语气回答学生的问题。回答要简洁明了，如果涉及具体数据，请引用上述信息。

学生的问题：${prompt}`;

            const result = await model.generateContent(context);
            const response = await result.response;
            const aiText = response.text();
            
            const aiMessage = { id: Date.now() + 1, text: aiText, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI 调用失败:', error);
            setApiKeyError(true);
            
            const errorMessage = {
                id: Date.now() + 1,
                text: `❌ API 调用失败：${error.message}\n\n**解决方案：**\n1. 确保你有有效的 Google AI API Key\n2. 在项目根目录的 \`.env\` 文件中设置：\n   \`VITE_GOOGLE_AI_API_KEY=your_actual_api_key\`\n3. 重新启动开发服务器（npm run dev）\n\n如需获取 API Key，请访问 [Google AI Studio](https://aistudio.google.com/app/apikey)`,
                isUser: false,
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const categories = [
        { title: "学业规划", prompt: "我下周的 deadline 有哪些？" },
        { title: "成绩分析", prompt: "调取一下，另外我想知道我目前的成绩情况" },
        { title: "校园资源", prompt: "ucl 图书馆几点开门" },
    ];

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white px-4 pt-4">AI 助手</h1>
            
            {apiKeyError && (
                <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        ⚠️ <strong>API 配置问题：</strong> 请检查 .env 文件中的 VITE_GOOGLE_AI_API_KEY 是否有效
                    </p>
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="p-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                            <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">我是您的学业助手</h2>
                        <p className="text-gray-500 dark:text-gray-400">可以问我关于课程、成绩或截止日期的问题。</p>
                        
                        <div className="w-full space-y-2 mt-6">
                            {categories.map(cat => (
                                <button
                                    key={cat.title}
                                    onClick={() => handleSend(cat.prompt)}
                                    className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-left transition-transform active:scale-95"
                                >
                                    <h3 className="font-medium text-gray-900 dark:text-white">{cat.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">"{cat.prompt}"</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                            msg.isUser 
                                ? 'bg-indigo-600 text-white' 
                                : msg.isError
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        }`}>
                            <ReactMarkdown 
                                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                                components={{
                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-3" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                                    hr: ({node, ...props}) => <hr className="my-3 border-gray-300 dark:border-gray-600" {...props} />,
                                    table: ({node, ...props}) => <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 my-2" {...props} />,
                                    th: ({node, ...props}) => <th className="px-3 py-1 text-left text-xs font-medium uppercase" {...props} />,
                                    td: ({node, ...props}) => <td className="px-3 py-1 text-sm" {...props} />,
                                    a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 underline" {...props} />,
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-sm">
                            <span className="animate-pulse text-sm">正在思考...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder="向 AI 助手提问..."
                        className="flex-1 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={() => handleSend(input)}
                        disabled={isProcessing || input.length === 0}
                        className="p-3 bg-indigo-600 text-white rounded-lg shadow disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


/**
 * Page: Activities (from iOS ActivitiesView)
 */
const ActivitiesPage = ({ t }) => {
    const { language } = useTranslation();
    const [selectedType, setSelectedType] = useState('全部');
    
    const activityTypes = ['全部', '学术竞赛', '学术讲座', '社团活动', '志愿服务', '文化活动', '职业发展', '体育赛事', '学术研讨', '健康活动', '节日活动'];
    
    const activityTypeTranslations = {
        '全部': language === 'en' ? 'All' : '全部',
        '学术竞赛': language === 'en' ? 'Academic Competitions' : '学术竞赛',
        '学术讲座': language === 'en' ? 'Academic Lectures' : '学术讲座',
        '社团活动': language === 'en' ? 'Club Activities' : '社团活动',
        '志愿服务': language === 'en' ? 'Volunteer Service' : '志愿服务',
        '文化活动': language === 'en' ? 'Cultural Events' : '文化活动',
        '职业发展': language === 'en' ? 'Career Development' : '职业发展',
        '体育赛事': language === 'en' ? 'Sports Events' : '体育赛事',
        '学术研讨': language === 'en' ? 'Academic Seminars' : '学术研讨',
        '健康活动': language === 'en' ? 'Health Activities' : '健康活动',
        '节日活动': language === 'en' ? 'Festival Events' : '节日活动'
    };
    
    const getTypeColor = (type) => {
        const colorMap = {
            '学术竞赛': '#F59E0B',
            '学术讲座': '#3B82F6',
            '社团活动': '#8B5CF6',
            '志愿服务': '#10B981',
            '文化活动': '#A855F7',
            '职业发展': '#F59E0B',
            '体育赛事': '#10B981',
            '学术研讨': '#6366F1',
            '健康活动': '#EC4899',
            '节日活动': '#F97316'
        };
        return colorMap[type] || '#6B7280';
    };
    
    const filteredActivities = selectedType === '全部' 
        ? activities 
        : activities.filter(activity => activity.type === selectedType);

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{language === 'en' ? '🎯 Campus Events' : '🎯 校园活动'}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 -mt-3">{language === 'en' ? 'Discover exciting UCL campus events' : '发现精彩的UCL校园活动'}</p>
            
            {/* Filter Pills */}
            <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-2 pb-2">
                    {activityTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                                selectedType === type
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-sm'
                            }`}
                        >
                            {activityTypeTranslations[type]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activities List */}
            {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                        <span className="text-3xl">✨</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{t ? t('student.noEventsOfThisType') : '暂无该类型的活动'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{language === 'en' ? 'Check back later' : '稍后再来看看吧'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} getTypeColor={getTypeColor} language={language} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Activity Card Component
const ActivityCard = ({ activity, getTypeColor, language = 'zh' }) => {
    const translatedActivity = getTranslatedActivity(activity, language);
    const IconComponent = activity.icon;
    const typeColor = getTypeColor(activity.type);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {/* Time Indicator */}
                <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-base font-bold" style={{ color: typeColor }}>
                        {activity.startTime}
                    </span>
                    <div className="w-0.5 h-5 my-1 bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {translatedActivity.title}
                        </h3>
                        <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                            style={{ backgroundColor: `${typeColor}20` }}
                        >
                            <IconComponent className="w-5 h-5" style={{ color: typeColor }} />
                        </div>
                    </div>

                    <span 
                        className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-3"
                        style={{ 
                            color: typeColor,
                            backgroundColor: `${typeColor}15`
                        }}
                    >
                        {translatedActivity.type}
                    </span>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: typeColor }} />
                            <span className="line-clamp-1">{translatedActivity.location}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {translatedActivity.description}
                        </p>
                    </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            </div>
        </div>
    );
};

/**
 * Page: Email (from StudentEmailView.swift)
 */
const Email = ({ t }) => {
    const { openModal } = useApp();
    const { language } = useTranslation();
    const [filter, setFilter] = useState("全部");
    const categories = ["全部", "紧急", "学术", "活动"];
    
    const categoryTranslations = {
        "全部": language === 'en' ? "All" : "全部",
        "紧急": language === 'en' ? "Urgent" : "紧急",
        "学术": language === 'en' ? "Academic" : "学术",
        "活动": language === 'en' ? "Events" : "活动"
    };
    
    const filteredEmails = mockEmails.filter(e => {
        if (filter === "全部") return true;
        if (filter === "紧急") return e.category === "Urgent";
        if (filter === "学术") return e.category === "Academic";
        if (filter === "活动") return e.category === "Events";
        return false;
    });

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Email' : '邮件'}</h1>
            
            {/* Stats */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex justify-around">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockEmails.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Total Emails' : '总邮件'}</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{mockEmails.filter(e => !e.isRead).length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Unread' : '未读'}</p>
                </div>
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap
                            ${filter === cat 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}
                        `}
                    >
                        {categoryTranslations[cat]}
                    </button>
                ))}
            </div>
            
            {/* Email List */}
            <div className="space-y-3">
                {filteredEmails.map(email => (
                    <EmailRow key={email.id} email={email} onClick={() => openModal('emailDetail', email.id)} language={language} />
                ))}
            </div>
        </div>
    );
};

// Email Sub-components
const EmailRow = ({ email, onClick, language = 'zh' }) => {
    const translatedEmail = getTranslatedEmail(email, language);
    const categoryStyles = {
        Urgent: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/50' },
        Academic: { icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
        Events: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/50' },
    };
    const style = categoryStyles[email.category] || { icon: Mail, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };

    return (
        <button onClick={onClick} className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-left flex space-x-4">
            {!email.isRead && (
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
            )}
            <div className={`p-3 rounded-full ${style.bg} self-start flex-shrink-0`}>
                <style.icon className={`w-5 h-5 ${style.color}`} />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                    <h3 className={`font-semibold truncate ${email.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{translatedEmail.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{email.date}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{translatedEmail.sender}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{translatedEmail.excerpt}</p>
            </div>
        </button>
    );
};

// --- Settings Page ---
const SettingsPage = ({ onLogout, language, setLanguage, t }) => {
    const [notifications, setNotifications] = useState(true);
    const [shareGrades, setShareGrades] = useState(true);
    const [shareCalendar, setShareCalendar] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">{t('settings')}</h1>
            
            {/* 语言设置 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t('student.language')}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    {[
                        { value: 'zh', label: '简体中文' },
                        { value: 'en', label: 'English' }
                    ].map((lang, index) => (
                        <button
                            key={lang.value}
                            onClick={() => setLanguage(lang.value)}
                            className={`w-full flex items-center justify-between p-4 ${
                                index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                            }`}
                        >
                            <span className="font-medium">{lang.label}</span>
                            {language === lang.value && (
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* 数据共享 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t('student.privacy')}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <div className="font-medium">{t('student.shareGrades')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('student.shareGradesDesc')}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShareGrades(!shareGrades)}
                            className={`w-12 h-7 rounded-full transition-colors ${
                                shareGrades ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            } relative`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                shareGrades ? 'translate-x-6' : 'translate-x-1'
                            }`}></div>
                        </button>
                    </div>
                    
                    <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <div className="font-medium">{t('student.shareSchedule')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('student.shareScheduleDesc')}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShareCalendar(!shareCalendar)}
                            className={`w-12 h-7 rounded-full transition-colors ${
                                shareCalendar ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            } relative`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                shareCalendar ? 'translate-x-6' : 'translate-x-1'
                            }`}></div>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* 通知设置 */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t('student.notifications')}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-medium">推送通知</span>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-7 rounded-full transition-colors ${
                                notifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                            } relative`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                notifications ? 'translate-x-6' : 'translate-x-1'
                            }`}></div>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* 退出登录 */}
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border-2 border-red-200 dark:border-red-800"
            >
                <User className="w-5 h-5" />
                <span>{t('student.logout')}</span>
            </button>
            
            {/* 退出确认弹窗 */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-xl font-bold mb-4">确认退出登录？</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">退出后需要重新登录才能使用应用</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium"
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

// --- Main App Component ---

export default function App({ onLogout }) {
    return (
        <AppProvider>
            <ScheduleProvider>
                <MainApp onLogout={onLogout} />
            </ScheduleProvider>
        </AppProvider>
    );
}

function MainApp({ onLogout }) {
    const [selectedTab, setSelectedTab] = useState("home");
    const { activeModal, closeModal } = useApp();
    const { language, setLanguage, t } = useTranslation('zh', 'student');

    const renderPage = () => {
        switch (selectedTab) {
            case "home":
                return <Dashboard t={t} />;
            case "academics":
                return <Academics t={t} />;
            case "calendar":
                return <CalendarPage t={t} />;
            case "health":
                return <Health t={t} />;          // ✅ 新增健康主页面
            case "ai":
                return <AIAssistant t={t} />;
            case "settings":
                return <SettingsPage onLogout={onLogout} language={language} setLanguage={setLanguage} t={t} />;
            default:
                return <Dashboard t={t} />;
        }
    };

    const renderModal = () => {
        if (!activeModal) return null;

        let content;
        switch (activeModal.type) {
            case 'addSchedule':
                content = <AddScheduleModal t={t} />;
                break;
            case 'addTodo':
                content = <AddTodoModal />;
                break;
            case 'appointmentBooking':
                content = <AppointmentBookingModal />;
                break;
            case 'medicalRecords':
                content = <MedicalRecordsModal />;
                break;
            case 'prescriptions':
                content = <PrescriptionsModal />;
                break;
            case 'emailDetail':
                content = <EmailDetailModal emailId={activeModal.payload} />;
                break;
            case 'moduleDetail':
                content = <ModuleDetailModal moduleId={activeModal.payload} />;
                break;
            case 'emailList':
                content = <Email t={t} />;
                break;
            case 'activitiesList':
                content = <ActivitiesPage t={t} />;
                break;
            case 'healthSummary':
                content = <Health t={t} />;
                break;
            case 'allergies':
                content = <AllergiesModal />;
                break;
            default:
                content = <div className="p-4 text-gray-900 dark:text-white">未知弹窗</div>;
        }

        return <Modal onClose={closeModal}>{content}</Modal>;
    };

    return (
        <div className="h-screen w-full flex flex-col font-sans bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/50 text-gray-900 dark:text-white">
            {/* 主内容区域 */}
            <main
                className={`flex-1 overflow-y-auto ${selectedTab === "ai" ? "p-0" : "p-4"} pb-20`}
            >
                {renderPage()}
            </main>

            {/* 底部导航 */}
            <BottomNav
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                t={t}
                language={language}
                setLanguage={setLanguage}
            />

            {/* 弹窗渲染 */}
            {activeModal && renderModal()}
        </div>
    );
}

// --- Bottom Navigation Component (底部导航) ---

const BottomNav = ({ selectedTab, setSelectedTab, t, language, setLanguage }) => {
    const navItems = [
        { id: "home", label: t("home"), icon: Home },
        { id: "academics", label: t("academics"), icon: BookOpen },
        { id: "calendar", label: t("calendar"), icon: Calendar },
        { id: "health", label: t("health") || "健康", icon: HeartPulse },
        { id: "ai", label: t("ai"), icon: BrainCircuit },
        { id: "settings", label: t("settings"), icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
            <div className="max-w-4xl mx-auto px-2 py-2">
                <div className="flex justify-around items-center">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedTab(item.id)}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-[60px] ${
                                selectedTab === item.id
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                        >
                            <item.icon className={`w-6 h-6 mb-1 ${selectedTab === item.id ? 'scale-110' : ''} transition-transform`} />
                            <span className="text-xs font-medium truncate max-w-[60px]">{item.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* 语言切换按钮 - 放在右上角 */}
                <button
                    onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    title={language === 'en' ? '切换到中文' : 'Switch to English'}
                >
                    {language === 'en' ? '中' : 'EN'}
                </button>
            </div>
        </nav>
    );
};