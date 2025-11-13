// 课程翻译数据
export const courseTranslations = {
  zh: {
    C01: { code: 'COMP0019', name: '软件工程导论', semester: '上学期' },
    C02: { code: 'STAT0023', name: '概率与统计', semester: '上学期' },
    C07: { code: 'MATH0058', name: '线性代数与矩阵论', semester: '上学期' },
    C08: { code: 'BIOL0007', name: '分子生物学基础', semester: '上学期' },
    C09: { code: 'PSYC0010', name: '研究方法与数据分析', semester: '上学期' },
    C10: { code: 'ENGL0045', name: '学术英语写作', semester: '上学期' },
    C03: { code: 'CHME0007', name: '数据科学与统计', nextDeadline: '项目报告 - 12月15日' },
    C04: { code: 'CHME0006', name: '健康数据科学原理', nextDeadline: '期末考试 - 1月5日' },
    C05: { code: 'BIOC0001', name: '生物统计学', nextDeadline: '论文 - 12月20日' },
    C06: { code: 'COMP0088', name: '机器学习入门', nextDeadline: '编程作业 #3 - 12月10日' },
    gradeComponentNames: {
      '期中考试': '期中考试',
      '课程项目': '课程项目',
      '平时作业': '平时作业',
      '期末考试': '期末考试',
      '实验报告': '实验报告',
      '课堂测验': '课堂测验',
      '课堂参与': '课堂参与',
      '论文写作': '论文写作',
      '演讲展示': '演讲展示',
      '研究设计': '研究设计',
      '数据分析报告': '数据分析报告',
      '口头报告': '口头报告',
    },
  },
  en: {
    C01: { code: 'COMP0019', name: 'Introduction to Software Engineering', semester: 'Fall Semester' },
    C02: { code: 'STAT0023', name: 'Probability and Statistics', semester: 'Fall Semester' },
    C07: { code: 'MATH0058', name: 'Linear Algebra and Matrix Theory', semester: 'Fall Semester' },
    C08: { code: 'BIOL0007', name: 'Fundamentals of Molecular Biology', semester: 'Fall Semester' },
    C09: { code: 'PSYC0010', name: 'Research Methods and Data Analysis', semester: 'Fall Semester' },
    C10: { code: 'ENGL0045', name: 'Academic English Writing', semester: 'Fall Semester' },
    C03: { code: 'CHME0007', name: 'Data Science and Statistics', nextDeadline: 'Project Report - Dec 15' },
    C04: { code: 'CHME0006', name: 'Health Data Science Principles', nextDeadline: 'Final Exam - Jan 5' },
    C05: { code: 'BIOC0001', name: 'Biostatistics', nextDeadline: 'Essay - Dec 20' },
    C06: { code: 'COMP0088', name: 'Introduction to Machine Learning', nextDeadline: 'Programming Assignment #3 - Dec 10' },
    gradeComponentNames: {
      '期中考试': 'Midterm Exam',
      '课程项目': 'Course Project',
      '平时作业': 'Assignments',
      '期末考试': 'Final Exam',
      '实验报告': 'Lab Report',
      '课堂测验': 'Quiz',
      '课堂参与': 'Class Participation',
      '论文写作': 'Essay Writing',
      '演讲展示': 'Presentation',
      '研究设计': 'Research Design',
      '数据分析报告': 'Data Analysis Report',
      '口头报告': 'Oral Presentation',
    },
  },
};

// 活动翻译
export const activitiesTranslations = {
  zh: {
    A01: { title: '校园科技展览会', type: '学术竞赛', location: '主方庭 (Main Quad)', description: '展示学期项目并与行业专家交流。Zoya的项目获得了"最佳创意奖"。' },
    A02: { title: 'AI与医疗健康前沿讲座', type: '学术讲座', location: 'Cruciform Lecture Theatre', description: 'UCL健康数据科学研究院邀请业界专家分享AI在医疗领域的最新应用。' },
    A03: { title: '数学竞赛小组周会', type: '社团活动', location: '数学系会议室', description: '每周一次的小组活动，解决具有挑战性的数学问题。' },
    A04: { title: '图书馆志愿者服务', type: '志愿服务', location: '主图书馆 (Main Library)', description: '协助整理书籍和引导新生，服务社区。' },
    A05: { title: 'UCL国际文化节', type: '文化活动', location: '学生会大楼 (Student Union)', description: '来自世界各地的学生展示自己国家的文化、美食和表演，庆祝多元文化。' },
    A06: { title: '职业发展工作坊：简历写作', type: '职业发展', location: 'IOE Building, Room 803', description: 'UCL职业服务中心举办的简历优化工作坊，帮助学生准备求职材料。' },
    A07: { title: '秋季羽毛球友谊赛', type: '体育赛事', location: 'Bloomsbury Fitness', description: 'UCL体育社团组织的羽毛球友谊赛，欢迎所有水平的学生参加。' },
    A08: { title: '机器学习研讨会', type: '学术研讨', location: 'Roberts Building 508', description: '计算机系组织的机器学习算法研讨会，由博士生分享最新研究成果。' },
    A09: { title: '心理健康意识周活动', type: '健康活动', location: '学生健康中心', description: 'UCL心理健康周活动，包括冥想工作坊、心理咨询和减压活动。' },
    A10: { title: 'UCL冬季音乐会', type: '文化活动', location: 'Bloomsbury Theatre', description: 'UCL音乐社团年度冬季音乐会，包括古典音乐、爵士乐和流行音乐表演。' },
    A11: { title: '数据科学黑客松', type: '学术竞赛', location: 'Computer Science Building', description: '24小时数据科学黑客松，挑战真实数据集，赢取丰厚奖品。' },
    A12: { title: '圣诞市集', type: '节日活动', location: '主方庭 (Main Quad)', description: 'UCL传统圣诞市集，有手工艺品、热巧克力和节日音乐表演。' },
  },
  en: {
    A01: { title: 'Campus Tech Expo', type: 'Academic Competition', location: 'Main Quad', description: 'Showcase semester projects and network with industry experts. Zoya\'s project won "Best Creative Idea Award".' },
    A02: { title: 'AI and Healthcare Frontier Lecture', type: 'Academic Lecture', location: 'Cruciform Lecture Theatre', description: 'UCL Health Data Science Institute invites industry experts to share latest AI applications in healthcare.' },
    A03: { title: 'Math Competition Group Meeting', type: 'Club Activity', location: 'Mathematics Department Meeting Room', description: 'Weekly group activities to solve challenging math problems.' },
    A04: { title: 'Library Volunteer Service', type: 'Volunteer Service', location: 'Main Library', description: 'Help organize books and guide new students to serve the community.' },
    A05: { title: 'UCL International Culture Festival', type: 'Cultural Activity', location: 'Student Union Building', description: 'Students from around the world showcase their country\'s culture, food, and performances celebrating multiculturalism.' },
    A06: { title: 'Career Development Workshop: Resume Writing', type: 'Career Development', location: 'IOE Building, Room 803', description: 'UCL Career Services hosts resume optimization workshop to help students prepare job application materials.' },
    A07: { title: 'Fall Badminton Friendly Match', type: 'Sports Event', location: 'Bloomsbury Fitness', description: 'UCL Sports Club organizes badminton friendly match welcoming students of all levels.' },
    A08: { title: 'Machine Learning Seminar', type: 'Academic Seminar', location: 'Roberts Building 508', description: 'Computer Science Department organizes machine learning algorithm seminar with PhD students sharing latest research.' },
    A09: { title: 'Mental Health Awareness Week', type: 'Health Activity', location: 'Student Health Center', description: 'UCL Mental Health Awareness Week activities including meditation workshops, counseling, and stress relief.' },
    A10: { title: 'UCL Winter Concert', type: 'Cultural Activity', location: 'Bloomsbury Theatre', description: 'UCL Music Club\'s annual winter concert featuring classical music, jazz, and pop performances.' },
    A11: { title: 'Data Science Hackathon', type: 'Academic Competition', location: 'Computer Science Building', description: '24-hour data science hackathon challenging real datasets with attractive prizes.' },
    A12: { title: 'Christmas Market', type: 'Festival Event', location: 'Main Quad', description: 'UCL traditional Christmas market with handicrafts, hot chocolate, and festive music performances.' },
  },
};

// 待办事项翻译
export const todoTranslations = {
  zh: {
    T01: { title: '完成机器学习作业 #3', course: '机器学习入门' },
    T02: { title: '准备数据科学项目报告', course: '数据科学与统计' },
    T03: { title: '复习生物统计学章节 5-7', course: '生物统计学' },
    T04: { title: '阅读健康数据科学原理的补充材料', course: '健康数据科学原理' },
    T05: { title: '小组会议讨论软件工程最终项目', course: '软件工程导论' },
    T06: { title: '提交生物统计学论文初稿', course: '生物统计学' },
    T07: { title: '预约论文指导会议 - Dr. Jenkins', course: '生物统计学' },
    T08: { title: '完成机器学习课后练习题集 #4', course: '机器学习入门' },
    T09: { title: '归还图书馆书籍', course: '其他' },
    T10: { title: '准备数据科学期中报告演讲稿', course: '数据科学与统计' },
  },
  en: {
    T01: { title: 'Complete Machine Learning Assignment #3', course: 'Introduction to Machine Learning' },
    T02: { title: 'Prepare Data Science Project Report', course: 'Data Science and Statistics' },
    T03: { title: 'Review Biostatistics Chapters 5-7', course: 'Biostatistics' },
    T04: { title: 'Read Supplementary Materials for Health Data Science Principles', course: 'Health Data Science Principles' },
    T05: { title: 'Group Meeting Discussion on Software Engineering Final Project', course: 'Introduction to Software Engineering' },
    T06: { title: 'Submit Biostatistics Essay Draft', course: 'Biostatistics' },
    T07: { title: 'Book Paper Guidance Meeting - Dr. Jenkins', course: 'Biostatistics' },
    T08: { title: 'Complete Machine Learning Exercise Set #4', course: 'Introduction to Machine Learning' },
    T09: { title: 'Return Books to Library', course: 'Other' },
    T10: { title: 'Prepare Data Science Midterm Report Presentation', course: 'Data Science and Statistics' },
  },
};

// 邮件翻译
export const emailTranslations = {
  zh: {
    M01: { sender: 'UCL学术办公室', title: '重要：关于下学期课程注册的提醒', excerpt: '亲爱的Zoya，请注意，下学期的课程注册将于12月1日开放...' },
    M02: { sender: 'Dr. Emily Carter', title: '回复：关于数据科学项目的问题', excerpt: 'Zoya你好，你的想法很棒，我建议你关注一下数据集的预处理部分...' },
    M03: { sender: 'UCL职业发展中心', title: '邀请函：冬季招聘会与校友分享', excerpt: '不要错过与顶尖公司招聘人员见面的机会！冬季招聘会将于12月10日举行...' },
    M04: { sender: '学生会', title: '本周活动速递：电影之夜与文化节', excerpt: '快来加入我们，放松一下！本周五晚7点在学生活动中心有免费的电影之夜...' },
    M05: { sender: '图书馆服务', title: '您的借书即将到期', excerpt: '您借阅的《Pattern Recognition and Machine Learning》将于3天后到期...' },
    M06: { sender: 'Prof. David Jones', title: '期末考试安排通知', excerpt: '各位同学，健康数据科学原理的期末考试将于2026年1月5日上午9点在Cruciform B304举行...' },
    M07: { sender: 'UCL信息技术服务', title: '系统维护通知：11月15日晚', excerpt: '为了提升服务质量，我们将于11月15日晚10点至次日凌晨2点进行系统维护...' },
    M08: { sender: 'Prof. Alan Smith', title: '机器学习作业#3延期通知', excerpt: '考虑到大家的学习负担，我决定将作业#3的截止日期延长至12月12日...' },
    M09: { sender: 'UCL学生福利团队', title: '心理健康意识周邀请', excerpt: '我们诚挚邀请你参加11月28日的心理健康意识周活动，包括冥想工作坊和心理咨询...' },
    M10: { sender: '学生资助部门', title: '奖学金申请开放通知', excerpt: 'UCL 2025-2026学年奖学金申请现已开放，截止日期为2026年1月31日...' },
    M11: { sender: 'UCL体育部门', title: '秋季羽毛球友谊赛报名', excerpt: '想要结识新朋友并保持活力吗？快来报名参加11月23日的羽毛球友谊赛...' },
    M12: { sender: 'Dr. Sarah Jenkins', title: '生物统计学论文指导预约', excerpt: 'Zoya，我看到你预约了本周四下午3点的论文指导。请提前准备好你的初稿...' },
  },
  en: {
    M01: { sender: 'UCL Academic Office', title: 'Important: Reminder for Next Semester Course Registration', excerpt: 'Dear Zoya, please note that course registration for next semester will open on December 1st...' },
    M02: { sender: 'Dr. Emily Carter', title: 'Re: Questions about Data Science Project', excerpt: 'Hi Zoya, your ideas are great, I suggest you focus on the data preprocessing part...' },
    M03: { sender: 'UCL Careers', title: 'Invitation: Winter Recruitment Fair and Alumni Sharing', excerpt: 'Don\'t miss the opportunity to meet recruiters from top companies! Winter recruitment fair on Dec 10...' },
    M04: { sender: 'Student Union', title: 'This Week\'s Events: Movie Night and Culture Festival', excerpt: 'Come join us and relax! Free movie night at Student Activity Center Friday evening at 7pm...' },
    M05: { sender: 'Library Services', title: 'Your Library Books Are Due Soon', excerpt: 'Your borrowed book "Pattern Recognition and Machine Learning" will be due in 3 days...' },
    M06: { sender: 'Prof. David Jones', title: 'Final Exam Schedule Notice', excerpt: 'Dear students, the final exam for Health Data Science Principles will be on January 5, 2026 at 9am in Cruciform B304...' },
    M07: { sender: 'UCL IT Services', title: 'System Maintenance Notice: Nov 15 Evening', excerpt: 'To improve service quality, we will perform system maintenance on Nov 15 from 10pm to 2am...' },
    M08: { sender: 'Prof. Alan Smith', title: 'Machine Learning Assignment #3 Extension Notice', excerpt: 'Considering your study load, I\'ve decided to extend the deadline for Assignment #3 to Dec 12...' },
    M09: { sender: 'UCL Wellbeing Team', title: 'Mental Health Awareness Week Invitation', excerpt: 'We warmly invite you to Mental Health Awareness Week on Nov 28, including meditation workshops and counseling...' },
    M10: { sender: 'Student Finance', title: 'Scholarship Application Open Notice', excerpt: 'UCL 2025-2026 academic year scholarship applications are now open, deadline January 31, 2026...' },
    M11: { sender: 'UCL Sports', title: 'Autumn Badminton Friendly Match Registration', excerpt: 'Want to make new friends and stay active? Register for our badminton friendly match on Nov 23...' },
    M12: { sender: 'Dr. Sarah Jenkins', title: 'Biostatistics Paper Guidance Appointment', excerpt: 'Zoya, I see you\'ve booked a 3pm paper guidance meeting Thursday. Please prepare your draft in advance...' },
  },
};

// 通用UI文本翻译
export const uiTranslations = {
  zh: {
    // 待办事项分类
    'assignment': '作业',
    'exam': '考试',
    'project': '项目',
    'reading': '阅读',
    'experiment': '实验',
    'essay': '论文',
    'other': '其他',
    
    // 优先级
    'low': '低',
    'medium': '中',
    'high': '高',
    
    // 课程页面标签
    'my-courses': '我的课程',
    'core-courses': '核心课程',
    'ongoing-courses': '继续课程',
    'completed': '已完成',
    'schedule': '课程表',
    
    // 成绩相关
    'total-score': '总成绩',
    'grade-breakdown': '成绩构成',
    'assignment-list': '作业列表',
    'course-not-found': '课程未找到',
    'submitted': '已提交',
    'due': '截止',
    'completed-courses': '已完成的课程',
    'ongoing': '进行中',
    
    // 健康相关
    'medical-records': '就诊历史',
    'prescriptions': '处方记录',
    'appointment-booking': '预约面诊',
    'allergies': '过敏史',
    'active': '使用中',
    'completed-status': '已完成',
    
    // 活动相关
    'activities-title': '校园活动',
    'activities-subtitle': '发现精彩的UCL校园活动',
    'no-events': '暂无该类型的活动',
    'check-back-later': '稍后再来看看吧',
    
    // 模态框标签
    'add-todo': '添加待办事项',
    'title': '标题',
    'required': '必填',
    'category': '分类',
    'priority': '优先级',
    'due-date': '截止日期',
    'notes': '备注',
    'add-button': '添加',
    'please-enter-title': '请输入标题',
    'enter-title': '请输入待办事项标题',
    'add-more-details': '添加更多详情...',
    
    // 日历相关
    'today': '今日',
    '7-days': '7天',
    'calendar': '日历',
    
    // 课程类型
    'lecture': '讲座',
    'tutorial': '实验课',
    'seminar': '研讨会',
    'revision': '复习课',
    
    // 其他
    'all-tasks-completed': '所有任务都已完成！',
    'no-todos': '暂无待办事项',
  },
  en: {
    // Assignment categories
    'assignment': 'Assignment',
    'exam': 'Exam',
    'project': 'Project',
    'reading': 'Reading',
    'experiment': 'Experiment',
    'essay': 'Essay',
    'other': 'Other',
    
    // Priority
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    
    // Course page tabs
    'my-courses': 'My Courses',
    'core-courses': 'Core Courses',
    'ongoing-courses': 'Ongoing Courses',
    'completed': 'Completed',
    'schedule': 'Schedule',
    
    // Grades
    'total-score': 'Total Score',
    'grade-breakdown': 'Grade Breakdown',
    'assignment-list': 'Assignment List',
    'course-not-found': 'Course not found',
    'submitted': 'Submitted',
    'due': 'Due',
    'completed-courses': 'Completed Courses',
    'ongoing': 'Ongoing',
    
    // Health
    'medical-records': 'Medical Records',
    'prescriptions': 'Prescriptions',
    'appointment-booking': 'Book Appointment',
    'allergies': 'Allergies',
    'active': 'Active',
    'completed-status': 'Completed',
    
    // Activities
    'activities-title': 'Campus Events',
    'activities-subtitle': 'Discover exciting UCL campus events',
    'no-events': 'No events of this type',
    'check-back-later': 'Check back later',
    
    // Modal labels
    'add-todo': 'Add Todo',
    'title': 'Title',
    'required': 'Required',
    'category': 'Category',
    'priority': 'Priority',
    'due-date': 'Due Date',
    'notes': 'Notes',
    'add-button': 'Add',
    'please-enter-title': 'Please enter title',
    'enter-title': 'Enter todo title',
    'add-more-details': 'Add more details...',
    
    // Calendar
    'today': 'Today',
    '7-days': '7 Days',
    'calendar': 'Calendar',
    
    // Course types
    'lecture': 'Lecture',
    'tutorial': 'Tutorial',
    'seminar': 'Seminar',
    'revision': 'Revision',
    
    // Other
    'all-tasks-completed': 'All tasks completed!',
    'no-todos': 'No todos',
  },
};
