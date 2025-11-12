import { Book, Calendar, CheckSquare, Mail, User, Trophy, Sparkles, Heart, Moon, Footprints, MessageCircle, PartyPopper, AlertTriangle, UserCircle, Info, Star, CheckCircle2, Hourglass, MapPin, Clock, ChevronDown, ChevronRight, ChevronLeft, Settings, Bell, Home, Send } from 'lucide-react';

// --- 核心学生信息 ---
export const studentInfo = {
  name: 'Zoya',
  id: '22041066',
  avatar: 'https://via.placeholder.com/150/A78BFA/FFFFFF?text=Z', // 紫色背景白色字母Z
  major: '健康数据科学硕士',
  university: '伦敦大学学院 (UCL)',
  gpa: 3.85,
  overallAverage: 85.4,
  degreeClassification: '一等荣誉学位 (First Class Honours)',
};

// --- 课程数据 ---
export const courses = {
  completed: [
    {
      id: 'C01',
      code: 'COMP0019',
      name: '软件工程导论',
      semester: '上学期',
      credit: 15,
      finalGrade: 88,
      gradeLevel: 'Distinction',
      components: [
        { name: '期中考试', percentage: 30, score: 85 },
        { name: '课程项目', percentage: 50, score: 90 },
        { name: '平时作业', percentage: 20, score: 86 },
      ],
    },
    {
      id: 'C02',
      code: 'STAT0023',
      name: '概率与统计',
      semester: '上学期',
      credit: 15,
      finalGrade: 82,
      gradeLevel: 'Distinction',
      components: [
        { name: '期末考试', percentage: 60, score: 80 },
        { name: '实验报告', percentage: 40, score: 85 },
      ],
    },
    {
      id: 'C07',
      code: 'MATH0058',
      name: '线性代数与矩阵论',
      semester: '上学期',
      credit: 15,
      finalGrade: 76,
      gradeLevel: 'Distinction',
      components: [
        { name: '期末考试', percentage: 70, score: 75 },
        { name: '课堂测验', percentage: 30, score: 78 },
      ],
    },
    {
      id: 'C08',
      code: 'BIOL0007',
      name: '分子生物学基础',
      semester: '上学期',
      credit: 15,
      finalGrade: 68,
      gradeLevel: 'Merit',
      components: [
        { name: '期末考试', percentage: 50, score: 66 },
        { name: '实验报告', percentage: 30, score: 70 },
        { name: '课堂参与', percentage: 20, score: 72 },
      ],
    },
    {
      id: 'C09',
      code: 'PSYC0010',
      name: '研究方法与数据分析',
      semester: '上学期',
      credit: 15,
      finalGrade: 91,
      gradeLevel: 'Distinction',
      components: [
        { name: '研究设计', percentage: 40, score: 92 },
        { name: '数据分析报告', percentage: 40, score: 90 },
        { name: '口头报告', percentage: 20, score: 91 },
      ],
    },
    {
      id: 'C10',
      code: 'ENGL0045',
      name: '学术英语写作',
      semester: '上学期',
      credit: 10,
      finalGrade: 79,
      gradeLevel: 'Distinction',
      components: [
        { name: '论文写作', percentage: 60, score: 80 },
        { name: '演讲展示', percentage: 40, score: 77 },
      ],
    },
  ],
  ongoing: [
    {
      id: 'C03',
      code: 'CHME0007',
      name: '数据科学与统计',
      lecturer: 'Dr. Emily Carter',
      nextDeadline: '项目报告 - 12月15日',
      progress: 75,
      currentGrade: '87 (A)',
    },
    {
      id: 'C04',
      code: 'CHME0006',
      name: '健康数据科学原理',
      lecturer: 'Prof. David Jones',
      nextDeadline: '期末考试 - 1月5日',
      progress: 60,
      currentGrade: '85 (A)',
    },
    {
      id: 'C05',
      code: 'BIOC0001',
      name: '生物统计学',
      lecturer: 'Dr. Sarah Jenkins',
      nextDeadline: '论文 - 12月20日',
      progress: 80,
      currentGrade: '82 (A-)',
    },
    {
      id: 'C06',
      code: 'COMP0088',
      name: '机器学习入门',
      lecturer: 'Prof. Alan Smith',
      nextDeadline: '编程作业 #3 - 12月10日',
      progress: 50,
      currentGrade: '88 (A)',
    },
  ],
};

// --- 待办事项/作业 (更多作业和任务) ---
export const todoItems = [
  { id: 'T01', title: '完成机器学习作业 #3', course: '机器学习入门', dueDate: '2025-12-12', isCompleted: false, priority: 'high' },
  { id: 'T02', title: '准备数据科学项目报告', course: '数据科学与统计', dueDate: '2025-12-15', isCompleted: false, priority: 'high' },
  { id: 'T03', title: '复习生物统计学章节 5-7', course: '生物统计学', dueDate: '2025-12-18', isCompleted: false, priority: 'medium' },
  { id: 'T04', title: '阅读健康数据科学原理的补充材料', course: '健康数据科学原理', dueDate: '2025-12-12', isCompleted: true, priority: 'low' },
  { id: 'T05', title: '小组会议讨论软件工程最终项目', course: '软件工程导论', dueDate: '2025-11-28', isCompleted: true, priority: 'medium' },
  { id: 'T06', title: '提交生物统计学论文初稿', course: '生物统计学', dueDate: '2025-12-20', isCompleted: false, priority: 'high' },
  { id: 'T07', title: '预约论文指导会议 - Dr. Jenkins', course: '生物统计学', dueDate: '2025-11-14', isCompleted: true, priority: 'medium' },
  { id: 'T08', title: '完成机器学习课后练习题集 #4', course: '机器学习入门', dueDate: '2025-11-16', isCompleted: false, priority: 'medium' },
  { id: 'T09', title: '归还图书馆书籍', course: '其他', dueDate: '2025-11-15', isCompleted: false, priority: 'low' },
  { id: 'T10', title: '准备数据科学期中报告演讲稿', course: '数据科学与统计', dueDate: '2025-11-18', isCompleted: true, priority: 'high' },
];

// --- 日历事件/课程表 (覆盖整个11月和12月初) ---
export const calendarEvents = [
  // 第一周 (11月11-17)
  { id: 'E01', course: '数据科学与统计', courseCode: 'CHME0007', type: '讲座', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-11-11T10:00:00', endTime: '2025-11-11T12:00:00' },
  { id: 'E02', course: '机器学习入门', courseCode: 'COMP0088', type: '实验课', lecturer: 'Prof. Alan Smith', location: 'Roberts 101', startTime: '2025-11-11T14:00:00', endTime: '2025-11-11T16:00:00' },
  { id: 'E03', course: '生物统计学', courseCode: 'BIOC0001', type: '研讨会', lecturer: 'Dr. Sarah Jenkins', location: 'Medawar G02', startTime: '2025-11-12T11:00:00', endTime: '2025-11-12T13:00:00' },
  { id: 'E04', course: '健康数据科学原理', courseCode: 'CHME0006', type: '讲座', lecturer: 'Prof. David Jones', location: 'Cruciform B304', startTime: '2025-11-13T09:00:00', endTime: '2025-11-13T11:00:00' },
  { id: 'E05', course: '数据科学与统计', courseCode: 'CHME0007', type: '实验课', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-11-13T14:00:00', endTime: '2025-11-13T16:00:00' },
  { id: 'E06', course: '机器学习入门', courseCode: 'COMP0088', type: '讲座', lecturer: 'Prof. Alan Smith', location: 'Roberts 508', startTime: '2025-11-14T10:00:00', endTime: '2025-11-14T12:00:00' },
  { id: 'E07', course: '生物统计学', courseCode: 'BIOC0001', type: '讲座', lecturer: 'Dr. Sarah Jenkins', location: 'Medawar G02', startTime: '2025-11-17T09:00:00', endTime: '2025-11-17T11:00:00' },
  
  // 第二周 (11月18-24)
  { id: 'E08', course: '数据科学与统计', courseCode: 'CHME0007', type: '讲座', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-11-18T10:00:00', endTime: '2025-11-18T12:00:00' },
  { id: 'E09', course: '机器学习入门', courseCode: 'COMP0088', type: '实验课', lecturer: 'Prof. Alan Smith', location: 'Roberts 101', startTime: '2025-11-18T14:00:00', endTime: '2025-11-18T16:00:00' },
  { id: 'E10', course: '健康数据科学原理', courseCode: 'CHME0006', type: '研讨会', lecturer: 'Prof. David Jones', location: 'Cruciform B304', startTime: '2025-11-19T13:00:00', endTime: '2025-11-19T15:00:00' },
  { id: 'E11', course: '生物统计学', courseCode: 'BIOC0001', type: '研讨会', lecturer: 'Dr. Sarah Jenkins', location: 'Medawar G02', startTime: '2025-11-19T11:00:00', endTime: '2025-11-19T13:00:00' },
  { id: 'E12', course: '数据科学与统计', courseCode: 'CHME0007', type: '实验课', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-11-20T14:00:00', endTime: '2025-11-20T16:00:00' },
  { id: 'E13', course: '机器学习入门', courseCode: 'COMP0088', type: '讲座', lecturer: 'Prof. Alan Smith', location: 'Roberts 508', startTime: '2025-11-21T10:00:00', endTime: '2025-11-21T12:00:00' },
  { id: 'E14', course: '健康数据科学原理', courseCode: 'CHME0006', type: '讲座', lecturer: 'Prof. David Jones', location: 'Cruciform B304', startTime: '2025-11-24T09:00:00', endTime: '2025-11-24T11:00:00' },
  
  // 第三周 (11月25-12月1)
  { id: 'E15', course: '数据科学与统计', courseCode: 'CHME0007', type: '讲座', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-11-25T10:00:00', endTime: '2025-11-25T12:00:00' },
  { id: 'E16', course: '机器学习入门', courseCode: 'COMP0088', type: '实验课', lecturer: 'Prof. Alan Smith', location: 'Roberts 101', startTime: '2025-11-25T14:00:00', endTime: '2025-11-25T16:00:00' },
  { id: 'E17', course: '生物统计学', courseCode: 'BIOC0001', type: '研讨会', lecturer: 'Dr. Sarah Jenkins', location: 'Medawar G02', startTime: '2025-11-26T11:00:00', endTime: '2025-11-26T13:00:00' },
  { id: 'E18', course: '健康数据科学原理', courseCode: 'CHME0006', type: '讲座', lecturer: 'Prof. David Jones', location: 'Cruciform B304', startTime: '2025-11-27T09:00:00', endTime: '2025-11-27T11:00:00' },
  { id: 'E19', course: '数据科学与统计', courseCode: 'CHME0007', type: '实验课', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-11-27T14:00:00', endTime: '2025-11-27T16:00:00' },
  { id: 'E20', course: '机器学习入门', courseCode: 'COMP0088', type: '讲座', lecturer: 'Prof. Alan Smith', location: 'Roberts 508', startTime: '2025-11-28T10:00:00', endTime: '2025-11-28T12:00:00' },
  { id: 'E21', course: '生物统计学', courseCode: 'BIOC0001', type: '讲座', lecturer: 'Dr. Sarah Jenkins', location: 'Medawar G02', startTime: '2025-12-01T09:00:00', endTime: '2025-12-01T11:00:00' },
  
  // 第四周 (12月2-8)
  { id: 'E22', course: '数据科学与统计', courseCode: 'CHME0007', type: '讲座', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-12-02T10:00:00', endTime: '2025-12-02T12:00:00' },
  { id: 'E23', course: '机器学习入门', courseCode: 'COMP0088', type: '实验课', lecturer: 'Prof. Alan Smith', location: 'Roberts 101', startTime: '2025-12-02T14:00:00', endTime: '2025-12-02T16:00:00' },
  { id: 'E24', course: '健康数据科学原理', courseCode: 'CHME0006', type: '研讨会', lecturer: 'Prof. David Jones', location: 'Cruciform B304', startTime: '2025-12-03T13:00:00', endTime: '2025-12-03T15:00:00' },
  { id: 'E25', course: '生物统计学', courseCode: 'BIOC0001', type: '研讨会', lecturer: 'Dr. Sarah Jenkins', location: 'Medawar G02', startTime: '2025-12-03T11:00:00', endTime: '2025-12-03T13:00:00' },
  { id: 'E26', course: '数据科学与统计', courseCode: 'CHME0007', type: '复习课', lecturer: 'Dr. Emily Carter', location: 'Darwin B40', startTime: '2025-12-04T14:00:00', endTime: '2025-12-04T16:00:00' },
  { id: 'E27', course: '机器学习入门', courseCode: 'COMP0088', type: '讲座', lecturer: 'Prof. Alan Smith', location: 'Roberts 508', startTime: '2025-12-05T10:00:00', endTime: '2025-12-05T12:00:00' },
  { id: 'E28', course: '健康数据科学原理', courseCode: 'CHME0006', type: '讲座', lecturer: 'Prof. David Jones', location: 'Cruciform B304', startTime: '2025-12-08T09:00:00', endTime: '2025-12-08T11:00:00' },
];

// --- 校园活动 (近期真实的UCL活动) ---
export const activities = [
    { id: 'A01', title: '校园科技展览会', type: '学术竞赛', location: '主方庭 (Main Quad)', date: '2025-11-05', startTime: '10:00', description: '展示学期项目并与行业专家交流。Zoya的项目获得了"最佳创意奖"。', icon: Trophy },
    { id: 'A02', title: 'AI与医疗健康前沿讲座', type: '学术讲座', location: 'Cruciform Lecture Theatre', date: '2025-11-14', startTime: '14:00', description: 'UCL健康数据科学研究院邀请业界专家分享AI在医疗领域的最新应用。', icon: Sparkles },
    { id: 'A03', title: '数学竞赛小组周会', type: '社团活动', location: '数学系会议室', date: '2025-11-15', startTime: '18:00', description: '每周一次的小组活动，解决具有挑战性的数学问题。', icon: Sparkles },
    { id: 'A04', title: '图书馆志愿者服务', type: '志愿服务', location: '主图书馆 (Main Library)', date: '2025-11-16', startTime: '13:00', description: '协助整理书籍和引导新生，服务社区。', icon: Heart },
    { id: 'A05', title: 'UCL国际文化节', type: '文化活动', location: '学生会大楼 (Student Union)', date: '2025-11-20', startTime: '17:00', description: '来自世界各地的学生展示自己国家的文化、美食和表演，庆祝多元文化。', icon: PartyPopper },
    { id: 'A06', title: '职业发展工作坊：简历写作', type: '职业发展', location: 'IOE Building, Room 803', date: '2025-11-22', startTime: '15:00', description: 'UCL职业服务中心举办的简历优化工作坊，帮助学生准备求职材料。', icon: Book },
    { id: 'A07', title: '秋季羽毛球友谊赛', type: '体育赛事', location: 'Bloomsbury Fitness', date: '2025-11-23', startTime: '16:00', description: 'UCL体育社团组织的羽毛球友谊赛，欢迎所有水平的学生参加。', icon: Trophy },
    { id: 'A08', title: '机器学习研讨会', type: '学术研讨', location: 'Roberts Building 508', date: '2025-11-27', startTime: '10:00', description: '计算机系组织的机器学习算法研讨会，由博士生分享最新研究成果。', icon: Sparkles },
    { id: 'A09', title: '心理健康意识周活动', type: '健康活动', location: '学生健康中心', date: '2025-11-28', startTime: '12:00', description: 'UCL心理健康周活动，包括冥想工作坊、心理咨询和减压活动。', icon: Heart },
    { id: 'A10', title: 'UCL冬季音乐会', type: '文化活动', location: 'Bloomsbury Theatre', date: '2025-12-05', startTime: '19:00', description: 'UCL音乐社团年度冬季音乐会，包括古典音乐、爵士乐和流行音乐表演。', icon: PartyPopper },
    { id: 'A11', title: '数据科学黑客松', type: '学术竞赛', location: 'Computer Science Building', date: '2025-12-07', startTime: '09:00', description: '24小时数据科学黑客松，挑战真实数据集，赢取丰厚奖品。', icon: Trophy },
    { id: 'A12', title: '圣诞市集', type: '节日活动', location: '主方庭 (Main Quad)', date: '2025-12-10', startTime: '11:00', description: 'UCL传统圣诞市集，有手工艺品、热巧克力和节日音乐表演。', icon: PartyPopper },
];

// --- 邮件数据 (更丰富的邮件列表) ---
export const emails = [
  { id: 'M01', sender: 'UCL Academic Office', title: '重要：关于下学期课程注册的提醒', excerpt: '亲爱的Zoya，请注意，下学期的课程注册将于12月1日开放...', date: '3天前', isRead: false, category: 'Urgent' },
  { id: 'M02', sender: 'Dr. Emily Carter', title: '回复：关于数据科学项目的问题', excerpt: 'Zoya你好，你的想法很棒，我建议你关注一下数据集的预处理部分...', date: '5天前', isRead: false, category: 'Academic' },
  { id: 'M03', sender: 'UCL Careers', title: '邀请函：冬季招聘会与校友分享', excerpt: '不要错过与顶尖公司招聘人员见面的机会！冬季招聘会将于12月10日举行...', date: '11月8日', isRead: true, category: 'Events' },
  { id: 'M04', sender: 'Student Union', title: '本周活动速递：电影之夜与文化节', excerpt: '快来加入我们，放松一下！本周五晚7点在学生活动中心有免费的电影之夜...', date: '11月10日', isRead: false, category: 'Events' },
  { id: 'M05', sender: 'Library Services', title: '您的借书即将到期', excerpt: '您借阅的《Pattern Recognition and Machine Learning》将于3天后到期...', date: '1天前', isRead: true, category: 'Academic' },
  { id: 'M06', sender: 'Prof. David Jones', title: '期末考试安排通知', excerpt: '各位同学，健康数据科学原理的期末考试将于2026年1月5日上午9点在Cruciform B304举行...', date: '2天前', isRead: false, category: 'Academic' },
  { id: 'M07', sender: 'UCL IT Services', title: '系统维护通知：11月15日晚', excerpt: '为了提升服务质量，我们将于11月15日晚10点至次日凌晨2点进行系统维护...', date: '11月11日', isRead: true, category: 'Urgent' },
  { id: 'M08', sender: 'Prof. Alan Smith', title: '机器学习作业#3延期通知', excerpt: '考虑到大家的学习负担，我决定将作业#3的截止日期延长至12月12日...', date: '11月9日', isRead: true, category: 'Academic' },
  { id: 'M09', sender: 'UCL Wellbeing Team', title: '心理健康意识周邀请', excerpt: '我们诚挚邀请你参加11月28日的心理健康意识周活动，包括冥想工作坊和心理咨询...', date: '11月7日', isRead: false, category: 'Events' },
  { id: 'M10', sender: 'Student Finance', title: '奖学金申请开放通知', excerpt: 'UCL 2025-2026学年奖学金申请现已开放，截止日期为2026年1月31日...', date: '11月5日', isRead: true, category: 'Urgent' },
  { id: 'M11', sender: 'UCL Sports', title: '秋季羽毛球友谊赛报名', excerpt: '想要结识新朋友并保持活力吗？快来报名参加11月23日的羽毛球友谊赛...', date: '11月4日', isRead: true, category: 'Events' },
  { id: 'M12', sender: 'Dr. Sarah Jenkins', title: '生物统计学论文指导预约', excerpt: 'Zoya，我看到你预约了本周四下午3点的论文指导。请提前准备好你的初稿...', date: '11月10日', isRead: false, category: 'Academic' },
];

export const emailDetails = {
  'UCL Academic Office': {
    original: "Dear Zoya,\n\nPlease be advised that course registration for the upcoming semester will open on December 1st and close on December 15th. It is crucial that you finalize your selections within this period to ensure your place in desired modules.\n\nFailure to register on time may result in limited course availability. Please consult your academic advisor if you have any questions.\n\nSincerely,\nUCL Academic Office",
    aiTranslation: "亲爱的Zoya，\n\n请注意，下学期的课程注册将于12月1日开放，并于12月15日截止。在此期间完成选课至关重要，以确保您能选上心仪的课程。\n\n未能按时注册可能会导致课程选择受限。如有任何疑问，请咨询您的学术导师。\n\n此致，\nUCL学术办公室",
    aiSummary: [
      "**核心事项**：下学期课程注册提醒。",
      "**关键日期**：12月1日开始，12月15日截止。",
      "**重要提醒**：务必按时注册，否则心仪课程可能没有名额。",
      "**后续步骤**：如有问题，请联系学术导师。"
    ]
  },
  // 其他邮件的详细信息可以按需添加
};


// --- 健康数据 ---
export const healthData = {
  day: [
    { id: 'H1', title: '睡眠时长', value: '7.8', unit: '小时', status: '良好', progress: 0.87, icon: Moon, color: 'indigo-500' },
    { id: 'H2', title: '今日步数', value: '8,520', unit: '步', status: '活跃', progress: 0.85, icon: Footprints, color: 'green-500' },
    { id: 'H3', title: '专注时长', value: '5.2', unit: '小时', status: '高效', progress: 0.75, icon: MessageCircle, color: 'blue-500' },
    { id: 'H4', title: '压力水平', value: '低', unit: '', status: '放松', progress: 0.2, icon: Heart, color: 'pink-500' },
  ],
  week: [
    { id: 'H1', title: '平均睡眠', value: '7.5', unit: '小时/天', status: '规律', progress: 0.82, icon: Moon, color: 'indigo-500' },
    { id: 'H2', title: '日均步数', value: '9,104', unit: '步', status: '非常活跃', progress: 0.91, icon: Footprints, color: 'green-500' },
    { id: 'H3', title: '总专注时长', value: '35', unit: '小时', status: '高效', progress: 0.8, icon: MessageCircle, color: 'blue-500' },
    { id: 'H4', title: '平均压力', value: '较低', unit: '', status: '平稳', progress: 0.25, icon: Heart, color: 'pink-500' },
  ],
  month: [
    { id: 'H1', title: '平均睡眠', value: '7.6', unit: '小时/天', status: '非常规律', progress: 0.85, icon: Moon, color: 'indigo-500' },
    { id: 'H2', title: '日均步数', value: '8,800', unit: '步', status: '活跃', progress: 0.88, icon: Footprints, color: 'green-500' },
    { id: 'H3', title: '总专注时长', value: '142', unit: '小时', status: '非常高效', progress: 0.82, icon: MessageCircle, color: 'blue-500' },
    { id: 'H4', title: '平均压力', value: '低', unit: '', status: '良好', progress: 0.22, icon: Heart, color: 'pink-500' },
  ]
};

// --- AI 助手对话示例 ---
export const aiConversations = [
    { 
        user: 'Zoya 最近的学习状况怎么样？', 
        ai: '📊 Zoya 最近的学习状况非常出色！\n\n✅ **本周完成作业**：5/5，全部按时提交。\n📈 **当前成绩**：她在《机器学习入门》和《数据科学与统计》两门课中都保持在87分以上，表现突出。\n⏰ **课堂出勤率**：100%，从未缺席。\n\n总体来看，她对新知识的掌握很扎实，学习状态非常积极。' 
    },
    { 
        user: '她最近有参加什么活动吗？', 
        ai: '🎯 是的，Zoya 的校园生活非常充实：\n\n🏆 **科技展览会**：她参与的项目获得了"最佳创意奖"，这是一个很棒的成就！\n🧠 **数学竞赛小组**：每周五她都会参加，锻炼逻辑思维能力。\n❤️ **图书馆志愿者**：本月已经完成了10小时的志愿服务，非常有爱心。\n\n这些活动不仅丰富了她的履历，也锻炼了她的综合能力。' 
    },
    { 
        user: '她和同学相处得怎么样？', 
        ai: '👥 Zoya 的社交情况很健康！\n\n🤝 **团队协作**：她是4个课程学习小组的成员，老师反馈她在团队中积极主动，乐于分享观点。\n😊 **同学关系**：她性格开朗，与超过15位同学保持着频繁的学术和社交互动。\n\n她似乎很好地融入了大学环境，并且建立了良好的支持网络。' 
    },
    { 
        user: '她这学期整体目标完成得怎么样？', 
        ai: '🏆 学期目标进展顺利：\n\n- **保持GPA 3.8以上**：目前为3.85，高于目标。\n- **完成3个研究项目**：已完成2个，第3个正在进行中。\n- **参加志愿活动20小时**：已完成15小时，进度超前。\n- **阅读10本专业书籍**：已读完7本。\n\n一切都在正轨上，预计她能超额完成本学期的所有目标！' 
    }
];
