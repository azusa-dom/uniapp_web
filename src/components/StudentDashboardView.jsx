import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../i18n';
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
  Book
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
  healthData 
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
    time: `${new Date(e.startTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})} - ${new Date(e.endTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`,
    location: e.location
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
    "我下周的 deadline 有哪些？": `
        为您整理了下周的重要截止日期：\n\n
        **紧急（2天内）**\n
        · CS Assignment - 11月9日 23:59\n
          完成进度：60%，还需完成第三部分\n\n
        **本周内**\n
        · 数据科学课程论文 - 11月12日\n
          建议：开始文献综述部分\n
        · 健康数据分析报告 - 11月13日\n
          状态：已收集数据，待分析\n\n
        我注意到您的 CS Assignment 进度稍慢，需要帮您制定完成计划吗？
    `,
    "好的，帮我安排一下": `
        已为您制定完成计划：\n\n
        **今天晚上 (3小时)**\n
        19:00-22:00 - 完成第三部分代码\n
        建议地点：Main Library (开放至23:00)\n\n
        **明天 (2小时)**\n
        14:00-16:00 - 代码测试与调试\n
        16:00-17:00 - 撰写文档说明\n\n
        已自动添加到您的日历。\n
        将在每个时间段前30分钟提醒您。
    `,
    "调取一下，另外我想知道我目前的成绩情况": `
        已为您准备好实验材料：\n
        Week 7 数据集 → Google Drive/UCL/DataScience/\n
        参考代码 → 已发送到邮箱\n\n
        **您的成绩分析报告**\n\n
        **总体表现**：一等学位水平 (81.7分)\n
        **排名**：Top 15% in your cohort\n\n
        **各科详情**：\n
        · 数据方法与健康研究：87分\n
        · 数据科学与统计：72分\n
        · 健康数据科学原理：67分\n\n
        **趋势分析**：\n
        · 较上月提升 +2.3分\n
        · 如果按时提交下周两份作业，预计总分可达 83-85分
    `,
    "ucl 图书馆几点开门": `
        UCL 主要有多个图书馆分馆，开放时间各不相同。\n\n
        📚 例如位于 Wilkins Building 的 Main Library（主馆）\n
        📍 地址：Gower Street, WC1E 6BT\n\n
        你想了解哪个图书馆呢？我可以帮你查询具体的开放时间 😊
    `,
    "default": `
        我理解您的问题。我可以帮您:\n
        • 📚 查询图书馆信息\n
        • 📊 分析成绩趋势\n
        • 📅 查看课程安排\n
        • 📝 管理作业截止日期\n
        • 🎯 制定学习计划\n\n
        请告诉我您最感兴趣的是哪一项?
    `
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

    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${style.bg} ${style.text}`}
        >
            <div className="flex items-center justify-center space-x-2">
                <Flag className="w-4 h-4" />
                <span className="font-medium text-sm capitalize">{priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}</span>
            </div>
        </button>
    );
};

// --- Modal Components ---

/**
 * Add Todo Modal (from AddTodoView.swift)
 */
const AddTodoModal = () => {
    const { closeModal, addTodo } = useApp();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("作业");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 16));
    const [hasDueDate, setHasDueDate] = useState(true);
    const [notes, setNotes] = useState("");

    const categories = ["作业", "考试", "项目", "阅读", "实验", "论文", "其他"];

    const handleSubmit = () => {
        if (!title) {
            // In a real app, use a better notification
            // For this environment, we'll avoid alert()
            console.error("请输入标题");
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">添加待办事项</h2>

            {/* Title */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                    标题 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入待办事项标题"
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <BookMarked className="w-4 h-4 mr-2 text-indigo-500" />
                    分类
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
                    优先级
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
                        截止日期
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
                    备注
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    placeholder="添加更多详情..."
                />
            </div>

            {/* Add Button */}
            <button
                onClick={handleSubmit}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-all"
            >
                <Plus className="w-5 h-5" />
                <span>添加待办事项</span>
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
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">处方记录</h2>
            <div className="space-y-3">
                {mockPrescriptions.map(p => (
                    <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{p.medicationName} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{p.specification}</span></span>
                            <span className={`py-1 px-3 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {p.status === 'active' ? '使用中' : '已完成'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{p.dosage}</p>
                        {p.status === 'active' && (
                            <div className="mt-2">
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    <span>剩余</span>
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
                                提醒: {p.reminderTime}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Email Detail Modal (from StudentEmailView.swift)
 */
const EmailDetailModal = ({ emailId }) => {
    const email = mockEmails.find(e => e.id === emailId);
    const detail = mockEmailDetails[email?.sender] || { original: email?.excerpt, aiTranslation: email?.excerpt, aiSummary: [] };
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    if (!email) return <div className="p-4 text-gray-900 dark:text-white">邮件未找到</div>;

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{email.title}</h2>
            <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">发件人: {email.sender}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">时间: {email.date}</p>
            </div>
            
            {/* Original Content */}
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">邮件内容</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{detail.original}</p>
            </div>

            {/* AI Buttons */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${showTranslation ? 'bg-green-600' : 'bg-indigo-600'}`}
                >
                    {showTranslation ? '已翻译' : 'AI 翻译'}
                </button>
                <button
                    onClick={() => setShowSummary(!showSummary)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${showSummary ? 'bg-green-600' : 'bg-indigo-600'}`}
                >
                    {showSummary ? '已总结' : 'AI 总结'}
                </button>
            </div>

            {/* AI Content */}
            {showTranslation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">AI 翻译</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{detail.aiTranslation}</p>
                </div>
            )}
            {showSummary && detail.aiSummary.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">AI 总结</h3>
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
    const module = mockModules.find(m => m.id === moduleId);
    if (!module) return <div className="p-4 text-gray-900 dark:text-white">课程未找到</div>;

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
                    <span className="text-lg font-medium text-gray-800 dark:text-gray-200">总成绩</span>
                    <span className={`text-4xl font-bold ${markColor(module.mark)}`}>{module.mark > 0 ? module.mark : 'N/A'}</span>
                </div>
            </div>

            {module.gradeBreakdown.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">成绩构成</h3>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">作业列表</h3>
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
                                {item.submitted ? `${item.grade}/100` : `截止: ${item.dueDate}`}
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
                <p className="text-base text-gray-600 dark:text-gray-400">MSc Health Data Science · Year 1</p>
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
                    <EmptyStateCard icon={Check} message={t ? "No classes today" : "今天没有课程，好好利用这段时间！"} />
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
            <div className="grid grid-cols-2 gap-3">
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
                    color="bg-gradient-to-br from-pink-500 to-pink-600"
                    onClick={() => openModal('healthSummary')}
                />
                <QuickAccessCard 
                    title={t ? t('calendar') : '日历'}
                    subtitle={t ? 'Full schedule' : '完整日程'}
                    icon={CalendarIcon}
                    color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                    onClick={() => console.log('Open calendar')}
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
        className={`${color} p-6 rounded-2xl shadow-lg text-white flex flex-col items-start transition-transform hover:scale-105 active:scale-95`}
    >
        <Icon className="w-8 h-8 mb-3 opacity-90" />
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
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
const Academics = () => {
    const { openModal } = useApp();
    const [selectedTab, setSelectedTab] = useState("modules");
    const tabs = [
        { id: "modules", label: "课程" },
        { id: "schedule", label: "课程表" }
    ];
    
    const validModules = mockModules.filter(m => m.mark > 0);
    const overallAverage = validModules.length > 0 ? validModules.reduce((acc, m) => acc + m.mark, 0) / validModules.length : 0;

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">学业</h1>
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
                                一等学位
                            </span>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">总平均分</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">优秀 - 一等学位水平!</p>
                        </div>
                    </div>
                    
                    {/* Modules List */}
                    <div className="space-y-3">
                        {mockModules.map(module => (
                            <ModuleCard key={module.id} module={module} onClick={() => openModal('moduleDetail', module.id)} />
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === "schedule" && (
                <div className="space-y-3">
                    {mockSchedule.map(item => <ScheduleCard key={item.id} item={item} />)}
                </div>
            )}
        </div>
    );
};

// Academics Sub-components
const ModuleCard = ({ module, onClick }) => {
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">{module.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{module.code}</p>
                </div>
                <div className="flex flex-col items-end">
                    {module.mark > 0 ? (
                        <span className={`text-2xl font-bold ${markColor(module.mark)}`}>{module.mark}</span>
                    ) : (
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">进行中</span>
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

const ScheduleCard = ({ item }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex space-x-4">
        <div className={`w-14 h-14 ${item.color} rounded-lg flex flex-col items-center justify-center flex-shrink-0`}>
            <span className="text-sm font-bold text-white">{item.dayOfWeek}</span>
        </div>
        <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.courseName}</h3>
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
const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState("day");
    
    const tabs = [
        { id: "day", label: "日" },
        { id: "week", label: "周" },
        { id: "month", label: "月" },
    ];
    
    const todayEvents = mockCalendarEvents.filter(e => 
        new Date(e.startTime).toDateString() === selectedDate.toDateString()
    );
    
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">日历</h1>
                <button className="p-2 bg-violet-600 text-white rounded-full shadow hover:bg-violet-700">
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <SegmentedControl tabs={tabs} selected={viewMode} setSelected={setViewMode} />
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                {viewMode === 'month' && <StudentMonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={mockCalendarEvents} />}
                {viewMode === 'week' && <StudentWeekView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={mockCalendarEvents} />}
                {viewMode === 'day' && <StudentDayView selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={mockCalendarEvents} />}
            </div>
            
            {viewMode !== 'week' && (
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">今日日程</h3>
                    {todayEvents.length > 0 ? (
                        todayEvents.map(event => (
                            <ModernEventCard 
                                key={event.id}
                                event={{ 
                                    title: event.course, 
                                    courseCode: event.courseCode,
                                    lecturer: event.lecturer,
                                    location: event.location, 
                                    startTime: new Date(event.startTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}), 
                                    endTime: new Date(event.endTime).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}), 
                                    type: event.type 
                                }}
                            />
                        ))
                    ) : (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-center text-gray-400 dark:text-gray-500">
                            <Book size={32} className="mx-auto mb-2 opacity-50" />
                            <p>今天没有课程安排</p>
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
 * Page: Health (from StudentHealthView.swift)
 */
const Health = () => {
    const { openModal } = useApp();
    const [range, setRange] = useState("day");
    const tabs = [
        { id: "day", label: "今日" },
        { id: "week", label: "7天" },
    ];
    const metrics = mockHealthMetrics[range];

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">健康</h1>
            
            {/* Health Records */}
            <div className="grid grid-cols-2 gap-3">
                <HealthRecordButton title="就诊历史" icon={ClipboardList} color="#6366F1" count={mockMedicalRecords.length} onClick={() => openModal('medicalRecords')} />
                <HealthRecordButton title="处方记录" icon={Pill} color="#EF4444" count={mockPrescriptions.filter(p => p.status === 'active').length} onClick={() => openModal('prescriptions')} />
                <HealthRecordButton title="预约面诊" icon={CalendarPlus} color="#10B981" count={0} onClick={() => openModal('appointmentBooking')} />
                <HealthRecordButton title="过敏史" icon={AlertTriangle} color="#F59E0B" count={1} onClick={() => console.log('过敏史：花粉')} />
            </div>

            <SegmentedControl tabs={tabs} selected={range} setSelected={setRange} />
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {metrics.map(metric => (
                    <HealthMetricCard key={metric.id} metric={metric} />
                ))}
            </div>
            
            {/* Tips Section */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">健康建议</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                </p>
            </div>
        </div>
    );
};

// Health Sub-components
const HealthRecordButton = ({ title, icon: Icon, color, count, onClick }) => (
    <button 
        onClick={onClick} 
        className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-left"
    >
        <div className="flex justify-between items-start">
            <Icon className="w-6 h-6" style={{ color: color }} />
            {count > 0 && (
                <span className="text-lg font-bold" style={{ color: color }}>
                    {count}
                </span>
            )}
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-3">{title}</h3>
    </button>
);

const HealthMetricCard = ({ metric }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
            <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
            <TrendIcon trend={metric.trend} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-3">{metric.title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metric.value} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{metric.unit}</span>
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full" style={{ width: `${metric.progress * 100}%`, backgroundColor: metric.color }}></div>
        </div>
    </div>
);


/**
 * Page: AI Assistant (from StudentAIAssistantView.swift)
 */
const AIAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef(null);
    const [useRealAI, setUseRealAI] = useState(true); // 是否使用真实 AI

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

        try {
            if (useRealAI) {
                // 使用真实的 Google Gemini AI
                const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'AIzaSyCGfAnODlgw4YsAP5_XhCUuZJ0OpMlam68';
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                
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
            } else {
                // 使用 demo 数据
                setTimeout(() => {
                    const aiResponse = demoConversations[prompt] || demoConversations["default"];
                    const aiMessage = { id: Date.now() + 1, text: aiResponse, isUser: false };
                    setMessages(prev => [...prev, aiMessage]);
                }, 1000);
            }
        } catch (error) {
            console.error('AI 调用失败:', error);
            // 如果 AI 调用失败，回退到 demo 数据
            const aiResponse = demoConversations[prompt] || "抱歉，我暂时无法回答这个问题。请稍后再试。";
            const aiMessage = { id: Date.now() + 1, text: aiResponse, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
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
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.isUser ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'}`}>
                            <ReactMarkdown className="text-sm">{msg.text}</ReactMarkdown>
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
const ActivitiesPage = () => {
    const [selectedType, setSelectedType] = useState('全部');
    
    const activityTypes = ['全部', '学术竞赛', '学术讲座', '社团活动', '志愿服务', '文化活动', '职业发展', '体育赛事', '学术研讨', '健康活动', '节日活动'];
    
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎯 校园活动</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 -mt-3">发现精彩的UCL校园活动</p>
            
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
                            {type}
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
                    <p className="text-gray-600 dark:text-gray-300 font-medium">暂无该类型的活动</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">稍后再来看看吧</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} getTypeColor={getTypeColor} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Activity Card Component
const ActivityCard = ({ activity, getTypeColor }) => {
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
                            {activity.title}
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
                        {activity.type}
                    </span>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: typeColor }} />
                            <span className="line-clamp-1">{activity.location}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {activity.description}
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
const Email = () => {
    const { openModal } = useApp();
    const [filter, setFilter] = useState("全部");
    const categories = ["全部", "紧急", "学术", "活动"];
    
    const filteredEmails = mockEmails.filter(e => {
        if (filter === "全部") return true;
        if (filter === "紧急") return e.category === "Urgent";
        if (filter === "学术") return e.category === "Academic";
        if (filter === "活动") return e.category === "Events";
        return false;
    });

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">邮件</h1>
            
            {/* Stats */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex justify-around">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockEmails.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">总邮件</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{mockEmails.filter(e => !e.isRead).length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">未读</p>
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
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Email List */}
            <div className="space-y-3">
                {filteredEmails.map(email => (
                    <EmailRow key={email.id} email={email} onClick={() => openModal('emailDetail', email.id)} />
                ))}
            </div>
        </div>
    );
};

// Email Sub-components
const EmailRow = ({ email, onClick }) => {
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
                    <h3 className={`font-semibold truncate ${email.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{email.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{email.date}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{email.sender}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{email.excerpt}</p>
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
            <MainApp onLogout={onLogout} />
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
            default:
                content = <div className="p-4 text-gray-900 dark:text-white">未知弹窗</div>;
        }

        return <Modal onClose={closeModal}>{content}</Modal>;
    };

    return (
        <div className="h-screen w-full flex flex-col font-sans bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/50 text-gray-900 dark:text-white">
            {/* Main Content Area */}
            <main className={`flex-1 overflow-y-auto pb-20 ${selectedTab === 'ai' ? 'p-0' : 'p-4'}`}>
                {renderPage()}
            </main>

            {/* Modal Renderer */}
            {activeModal && renderModal()}

            {/* Bottom Navigation */}
            <BottomNav 
                selectedTab={selectedTab} 
                setSelectedTab={setSelectedTab}
                t={t}
            />
        </div>
    );
}

// --- Bottom Navigation Component ---

const BottomNav = ({ selectedTab, setSelectedTab, t }) => {
    const navItems = [
        { id: "home", label: t('home'), icon: Home },
        { id: "academics", label: t('academics'), icon: BookOpen },
        { id: "calendar", label: t('calendar'), icon: Calendar },
        { id: "ai", label: t('ai'), icon: BrainCircuit },
        { id: "settings", label: t('settings'), icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-t-lg">
            <div className="max-w-4xl mx-auto flex justify-around items-center px-2 py-3">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedTab(item.id)}
                        className={`flex flex-col items-center justify-center w-14 transition-all
                            ${selectedTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500'}
                        `}
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs font-medium mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};