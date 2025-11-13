import { courseTranslations, activitiesTranslations, todoTranslations, emailTranslations, uiTranslations } from './courseTranslations';

// 通过 courseCode 查找课程名称
export const getCourseNameByCode = (courseCode, language = 'zh') => {
  // 遍历所有课程 ID，找到对应的 code
  for (const courseId in courseTranslations[language]) {
    if (courseTranslations[language][courseId].code === courseCode) {
      return courseTranslations[language][courseId].name || courseCode;
    }
  }
  return courseCode;
};

// 获取UI文本翻译
export const getUIText = (key, language = 'zh') => {
  return uiTranslations[language]?.[key] || key;
};

// 获取课程翻译
export const getCourseName = (courseId, language = 'zh') => {
  return courseTranslations[language]?.[courseId]?.name || courseId;
};

export const getCourseSemester = (courseId, language = 'zh') => {
  return courseTranslations[language]?.[courseId]?.semester || '';
};

export const getCourseCode = (courseId, language = 'zh') => {
  return courseTranslations[language]?.[courseId]?.code || '';
};

export const getComponentName = (name, language = 'zh') => {
  return courseTranslations[language]?.gradeComponentNames?.[name] || name;
};

// 获取活动翻译
export const getActivityTitle = (activityId, language = 'zh') => {
  return activitiesTranslations[language]?.[activityId]?.title || activityId;
};

export const getActivityType = (activityId, language = 'zh') => {
  return activitiesTranslations[language]?.[activityId]?.type || '';
};

export const getActivityLocation = (activityId, language = 'zh') => {
  return activitiesTranslations[language]?.[activityId]?.location || '';
};

export const getActivityDescription = (activityId, language = 'zh') => {
  return activitiesTranslations[language]?.[activityId]?.description || '';
};

// 获取待办事项翻译
export const getTodoTitle = (todoId, language = 'zh') => {
  return todoTranslations[language]?.[todoId]?.title || todoId;
};

export const getTodoCourse = (todoId, language = 'zh') => {
  return todoTranslations[language]?.[todoId]?.course || '';
};

// 获取邮件翻译
export const getEmailSender = (emailId, language = 'zh') => {
  return emailTranslations[language]?.[emailId]?.sender || emailId;
};

export const getEmailTitle = (emailId, language = 'zh') => {
  return emailTranslations[language]?.[emailId]?.title || '';
};

export const getEmailExcerpt = (emailId, language = 'zh') => {
  return emailTranslations[language]?.[emailId]?.excerpt || '';
};

// 获取完整的翻译课程对象
export const getTranslatedCourse = (course, language = 'zh') => {
  const trans = courseTranslations[language]?.[course.id];
  if (!trans) return course;
  
  return {
    ...course,
    name: trans.name || course.name,
    code: trans.code || course.code,
    semester: trans.semester || course.semester,
    nextDeadline: trans.nextDeadline || course.nextDeadline,
  };
};

// 获取完整的翻译活动对象
export const getTranslatedActivity = (activity, language = 'zh') => {
  const trans = activitiesTranslations[language]?.[activity.id];
  if (!trans) return activity;
  
  return {
    ...activity,
    title: trans.title || activity.title,
    type: trans.type || activity.type,
    location: trans.location || activity.location,
    description: trans.description || activity.description,
  };
};

// 获取完整的翻译待办项目对象
export const getTranslatedTodo = (todo, language = 'zh') => {
  const trans = todoTranslations[language]?.[todo.id];
  if (!trans) return todo;
  
  return {
    ...todo,
    title: trans.title || todo.title,
    course: trans.course || todo.course,
  };
};

// 获取完整的翻译邮件对象
export const getTranslatedEmail = (email, language = 'zh') => {
  const trans = emailTranslations[language]?.[email.id];
  if (!trans) return email;
  
  return {
    ...email,
    sender: trans.sender || email.sender,
    title: trans.title || email.title,
    excerpt: trans.excerpt || email.excerpt,
  };
};
