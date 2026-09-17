import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  AlertCircle,
  Users,
  Key,
  Globe
} from 'lucide-react';

type ThemeType = 'government' | 'dark' | 'light';
type ChartType = 'bars' | 'pie' | 'donut' | 'progress' | 'line' | 'network' | 'radial';
type UserRole = 'super_admin' | 'branch_admin' | 'viewer';
type LanguageType = 'ckb' | 'kmr' | 'en' | 'ar' | 'fa';

interface UserAccount {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  branchId?: number | null;
  name: string;
}

interface ElectionRound {
  id: number;
  name: string;
  date: string;
  type: string;
  totalVoters: number;
  status: 'چالاک' | 'تەواوبوو';
}

interface Branch {
  id: number;
  roundId: number;
  name: string;
}

interface Region {
  id: number;
  branchId: number;
  name: string;
}

interface PartyVote {
  partyId: number;
  partyName: string;
  votes: number;
  percentage: number;
  color: string;
  hexColor: string;
}

// فەرهەنگی زمانەکان (سۆرانی، کرمانجی، ئینگلیزی، عەرەبی، فارسی)
const translations = {
  ckb: {
    loginTitle: 'چوونەژوورەوە بۆ سیستەم',
    loginSubtitle: 'تکایە زانیارییەکانی بەکارهێنەر بنووسە',
    username: 'ناوی بەکارهێنەر',
    password: 'وشەی نهێنی',
    rememberMe: 'بیرم بکەرەوە',
    forgotPassword: 'پاسۆردت بیرچووە؟',
    loginBtn: 'چوونەژوورەوە',
    systemTitle: 'سیستەمی شیکاری ئەنجامەکانی هەڵبژاردن',
    userLabel: 'بەکارهێنەر:',
    superAdmin: 'بەڕێوەبەری گشتی',
    branchAdmin: 'ئەدمینی لق',
    viewer: 'چاودێر',
    themeLabel: 'تیمی ڕووکار:',
    governmentTheme: '🏛️ تیمی حکومی',
    darkTheme: '🌙 تیمی تۆخ',
    lightTheme: '☀️ تیمی ڕۆشن',
    logout: 'دەرچوون',
    mainSections: 'بەشە سەرەکییەکان',
    dashboardTab: 'داشبۆرد و هێڵکارییەکان',
    roundsTab: 'خولەکانی هەڵبژاردن',
    controlPanelTab: 'پەنێڵی کۆنتڕۆڵ و ئەکاونتەکان',
    myPasswordTab: 'گۆڕینی پاسوۆردی خۆم',
    dashboardHeading: 'داشبۆرد و شیکاری ئەنجامەکان',
    selectedRound: 'خولە هەڵبژاردراوەکە:',
    noRoundSelected: 'هیچ خولێک دیاری نەکراوە',
    chartTypeLabel: 'جۆری شێوازی چارت:',
    selectRoundPrompt: 'دیاریکردنی خولی هەڵبژاردن بۆ بینینی چارتەکان:',
    noRoundsWarning: 'تکایە سەرەتا لە بەشی "خولەکانی هەڵبژاردن" خولێک زیاد بکە.',
    filterBranchLabel: 'فلتەر بەپێی لقی هەڵبژاردن',
    allBranchesOption: 'هەموو لقەکان گشتی',
    filterAreaLabel: 'فلتەر بەپێی ناوچە / بنکە',
    allAreasOption: 'هەموو ناوچەکانی ئەم لقە',
    totalVotesLabel: 'کۆی دەنگەکان:',
    roundsListTitle: 'لیستی خولەکانی هەڵبژاردن',
    roundNameHeader: 'ناوی خول',
    roundDateHeader: 'بەڕێوەچوون',
    roundTypeHeader: 'جۆر',
    roundVotersHeader: 'کۆی دەنگدەران',
    actionsHeader: 'کردارەکان',
    editBtn: 'دەستکاری',
    deleteBtn: 'سڕینەوە',
    branchTabTitle: 'تابی لقەکان',
    manageBranchesTitle: 'بەڕێوەبردنی لقەکانی:',
    newBranchPlaceholder: 'ناوی لقی نوێ...',
    addBranchBtn: '+ زیادکردنی لقی نوێ',
    updateBtn: 'نوێکردنەوە',
    cancelBtn: 'پاشگەزبوونەوە',
    subTabRegions: 'سەب-تابی ناوچەکان',
    regionManagementTitle: 'ناوچەکانی سەر بە لق',
    newRegionPlaceholder: 'ناوی ناوچە/بنکە...',
    addRegionBtn: '+ زیادکردنی ناوچە',
    noRegionsWarning: '⚠️ هیچ ناوچەیەک بۆ ئەم لقە نییە، دەتوانیت دەنگەکان ڕاستەوخۆ لێرەوە داخڵ بکەیت:',
    directBranchEntry: '📋 داخڵکردنی دەنگی لایەنەکان ڕاستەوخۆ لەسەر ئاستی لق',
    selectedBranchBadge: 'لقی هەڵبژاردراو',
    votesCountLabel: 'ژمارەی دەنگ:',
    percentageLabel: 'ڕێژەی سەدی:',
    controlPanelTitle: 'پەنێڵی بەڕێوەبردنی ئەکاونتەکان',
    controlPanelSubtitle: 'دروستکردنی ئەکاونتی نوێ بۆ لقەکان یان چاودێران (Viewer)',
    fullNameLabel: 'ناوی تەواو / ناوەند',
    roleLabel: 'ڕۆڵی بەکارهێنەر',
    branchAdminRole: 'ئەدمینی لق (Branch Admin)',
    viewerRole: 'چاودێر (Viewer - بینین)',
    selectBranchPlaceholder: '-- لقی مەبەست هەڵبژێرە --',
    createAccountBtn: '+ دروستکردنی ئەکاونت',
    accountsListTitle: 'لیستی هەموو ئەکاونتەکان و بینین/گۆڕینی پاسوۆردەکانیان لە داتابەیسدا',
    passwordDbHeader: 'پاسوۆرد (داتابەیس)',
    linkedBranchHeader: 'لقی پەیوەندیدار',
    generalOrNone: 'هیچ / گشتی',
    changeMyPasswordTitle: 'گۆڕینی وشەی نهێنی (پاسوۆردی خۆت)',
    changeMyPasswordSubtitle: 'ئەدمینی لق دەتوانێت پاسوۆردەکەی لێرە بگۆڕێت و لە داتابەیسدا نوێ دەبێتەوە',
    newPasswordLabel: 'وشەی نهێنی نوێ',
    saveNewPasswordBtn: 'پاشەکەوتکردنی پاسوۆردی نوێ لە داتابەیسدا',
  },
  kmr: {
    loginTitle: 'چوونا ژوورە بۆ سیستەمێ',
    loginSubtitle: 'تکایە زانیاریێن بکارئینەر بنڤیسە',
    username: 'ناڤێ بکارئینەر',
    password: 'پەیڤا نهێنی',
    rememberMe: 'بیره نه‌کە',
    forgotPassword: 'پاسۆردا تە ژبیر چوو؟',
    loginBtn: 'چوونا ژوورە',
    systemTitle: 'سیستەمێ شیکاریا ئەنجامێن هەلبژارتنان',
    userLabel: 'بکارئینەر:',
    superAdmin: 'رێڤەبەرێ گشتی',
    branchAdmin: 'ئەدمینێ لقێ',
    viewer: 'چاودێر',
    themeLabel: 'تیمێ ڕوکارێ:',
    governmentTheme: '🏛️ تیمێ حکومی',
    darkTheme: '🌙 تیمێ تاری',
    lightTheme: '☀️ تیمێ ڕۆناهی',
    logout: 'دەرتن',
    mainSections: 'بەشێن سەرەکی',
    dashboardTab: 'داشبۆرد و نەخشە',
    roundsTab: 'خولێن هەلبژارتنێ',
    controlPanelTab: 'پەنێلا کۆنتڕۆڵ و ئەکاونت',
    myPasswordTab: 'گوهۆڕینا پاسۆردا خو',
    dashboardHeading: 'داشبۆرد و شیکاریا ئەنجامان',
    selectedRound: 'خولا هەلبژارتی:',
    noRoundSelected: 'چ خول ناتە هറ്റ്‌ هەلبژارتن',
    chartTypeLabel: 'جۆرێ نەخشێ:',
    selectRoundPrompt: 'دیارکرنا خولا هەلبژارتنێ بۆ دیتنا نەخشان:',
    noRoundsWarning: 'تکایە سەرەتا ژ بەشا "خولێن هەلبژارتنێ" خولەکێ زێدە بکە.',
    filterBranchLabel: 'فلتەر ل دووڤ لقێ هەلبژارتنێ',
    allBranchesOption: 'هەمی لقێن گشتی',
    filterAreaLabel: 'فلتەر ل دووڤ دەڤەرێ / بنکە',
    allAreasOption: 'هەمی دەڤەرێن ڤی لقێ',
    totalVotesLabel: 'کۆما دەنگان:',
    roundsListTitle: 'لیستا خولێن هەلبژارتنێ',
    roundNameHeader: 'ناڤێ خولێ',
    roundDateHeader: 'رۆژا برێڤەچوونێ',
    roundTypeHeader: 'جۆر',
    roundVotersHeader: 'کۆما دەنگدەران',
    actionsHeader: 'کریار',
    editBtn: 'دەستکاری',
    deleteBtn: 'ژێبرن',
    branchTabTitle: 'تابا لقان',
    manageBranchesTitle: 'رێڤەبرنا لقێن:',
    newBranchPlaceholder: 'ناڤێ لقێ نوو...',
    addBranchBtn: '+ زێدەکرنا لقێ نوو',
    updateBtn: 'نووکرن',
    cancelBtn: 'پاشگەزبۆن',
    subTabRegions: 'سەب-تابا دەڤەران',
    regionManagementTitle: 'دەڤەرێن سەر ب لقێ',
    newRegionPlaceholder: 'ناڤێ دەڤەرێ/بنکێ...',
    addRegionBtn: '+ زێدەکرنا دەڤەرێ',
    noRegionsWarning: '⚠️ چ دەڤەر بۆ ڤی لقێ نینن، دکاری دەنگان ڕاستەوخۆ ژ ڤێرە تێخەی:',
    directBranchEntry: '📋 تێخستنا دەنگێن لایەنان ڕاستەوخۆ لەسەر ئاستێ لقێ',
    selectedBranchBadge: 'لقێ هەلبژارتی',
    votesCountLabel: 'ژمارا دەنگان:',
    percentageLabel: 'رێژا سەدی:',
    controlPanelTitle: 'پەنێلا رێڤەبرنا ئەکاونتان',
    controlPanelSubtitle: 'چێکرنا ئەکاونتێن نوو بۆ لقان یان چاودێران (Viewer)',
    fullNameLabel: 'ناڤێ تەواڤ / ناڤەند',
    roleLabel: 'رۆلا بکارئینەر',
    branchAdminRole: 'ئەدمینێ لقێ (Branch Admin)',
    viewerRole: 'چاودێر (Viewer - دیتن)',
    selectBranchPlaceholder: '-- لقێ مەرەم هەلبژێرە --',
    createAccountBtn: '+ چێکرنا ئەکاونتی',
    accountsListTitle: 'لیستا هەمی ئەکاونتان و دیتن/گوهۆڕینا پاسۆردێن وان د داتابەیسێ دا',
    passwordDbHeader: 'پاسۆرد (داتابەیس)',
    linkedBranchHeader: 'لقێ پەیوەندیدار',
    generalOrNone: 'چ / گشتی',
    changeMyPasswordTitle: 'گوهۆڕینا پەیڤا نهێنی (پاسۆردا تە)',
    changeMyPasswordSubtitle: 'ئەدمینێ لقێ دکارت پاسۆردا خو ل ڤێرە بگوهێزت و د داتابەیسێ دا نوو دبیت',
    newPasswordLabel: 'پاسۆردا نوو',
    saveNewPasswordBtn: 'پاشەکەوتکرنا پاسۆردا نوو د داتابەیسێ دا',
  },
  en: {
    loginTitle: 'System Login',
    loginSubtitle: 'Please enter your user credentials',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginBtn: 'Login',
    systemTitle: 'Election Results Analysis System',
    userLabel: 'User:',
    superAdmin: 'Super Admin',
    branchAdmin: 'Branch Admin',
    viewer: 'Viewer',
    themeLabel: 'Theme:',
    governmentTheme: '🏛️ Government',
    darkTheme: '🌙 Dark',
    lightTheme: '☀️ Light',
    logout: 'Logout',
    mainSections: 'Main Sections',
    dashboardTab: 'Dashboard & Charts',
    roundsTab: 'Election Rounds',
    controlPanelTab: 'Control Panel & Accounts',
    myPasswordTab: 'Change My Password',
    dashboardHeading: 'Dashboard & Results Analysis',
    selectedRound: 'Selected Round:',
    noRoundSelected: 'No round selected',
    chartTypeLabel: 'Chart Type:',
    selectRoundPrompt: 'Select election round to view charts:',
    noRoundsWarning: 'Please first add a round from the "Election Rounds" section.',
    filterBranchLabel: 'Filter by Election Branch',
    allBranchesOption: 'All General Branches',
    filterAreaLabel: 'Filter by Region / Center',
    allAreasOption: 'All regions of this branch',
    totalVotesLabel: 'Total Votes:',
    roundsListTitle: 'Election Rounds List',
    roundNameHeader: 'Round Name',
    roundDateHeader: 'Date',
    roundTypeHeader: 'Type',
    roundVotersHeader: 'Total Voters',
    actionsHeader: 'Actions',
    editBtn: 'Edit',
    deleteBtn: 'Delete',
    branchTabTitle: 'Branches Tab',
    manageBranchesTitle: 'Manage Branches of:',
    newBranchPlaceholder: 'New branch name...',
    addBranchBtn: '+ Add New Branch',
    updateBtn: 'Update',
    cancelBtn: 'Cancel',
    subTabRegions: 'Regions Sub-Tab',
    regionManagementTitle: 'Regions belonging to branch',
    newRegionPlaceholder: 'Region/Center name...',
    addRegionBtn: '+ Add Region',
    noRegionsWarning: '⚠️ No regions for this branch, you can enter votes directly here:',
    directBranchEntry: '📋 Direct Party Vote Entry at Branch Level',
    selectedBranchBadge: 'Selected Branch',
    votesCountLabel: 'Vote Count:',
    percentageLabel: 'Percentage:',
    controlPanelTitle: 'Accounts Control Panel',
    controlPanelSubtitle: 'Create new accounts for branches or viewers',
    fullNameLabel: 'Full Name / Center',
    roleLabel: 'User Role',
    branchAdminRole: 'Branch Admin',
    viewerRole: 'Viewer',
    selectBranchPlaceholder: '-- Select Target Branch --',
    createAccountBtn: '+ Create Account',
    accountsListTitle: 'List of all accounts and view/change their passwords in database',
    passwordDbHeader: 'Password (Database)',
    linkedBranchHeader: 'Linked Branch',
    generalOrNone: 'None / General',
    changeMyPasswordTitle: 'Change My Password',
    changeMyPasswordSubtitle: 'Branch admin can change their password here and update it in database',
    newPasswordLabel: 'New Password',
    saveNewPasswordBtn: 'Save New Password in Database',
  },
  ar: {
    loginTitle: 'تسجيل الدخول للنظام',
    loginSubtitle: 'الرجاء إدخال بيانات المستخدم',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    loginBtn: 'تسجيل الدخول',
    systemTitle: 'نظام تحليل نتائج الانتخابات',
    userLabel: 'المستخدم:',
    superAdmin: 'المدير العام',
    branchAdmin: 'مدير الفرع',
    viewer: 'مشاهد',
    themeLabel: 'مظهر النظام:',
    governmentTheme: '🏛️ حكومي',
    darkTheme: '🌙 داكن',
    lightTheme: '☀️ فاتح',
    logout: 'تسجيل الخروج',
    mainSections: 'الأقسام الرئيسية',
    dashboardTab: 'لوحة القيادة والرسوم البيانية',
    roundsTab: 'الدورات الانتخابية',
    controlPanelTab: 'لوحة التحكم والحسابات',
    myPasswordTab: 'تغيير كلمة المرور الخاصة بي',
    dashboardHeading: 'لوحة القيادة وتحليل النتائج',
    selectedRound: 'الدورة المختارة:',
    noRoundSelected: 'لم يتم اختيار دورة',
    chartTypeLabel: 'نوع الرسم البياني:',
    selectRoundPrompt: 'حدد الدورة الانتخابية لعرض الرسوم البيانية:',
    noRoundsWarning: 'الرجاء إضافة دورة أولاً من قسم "الدورات الانتخابية".',
    filterBranchLabel: 'تصفية حسب فرع الانتخابات',
    allBranchesOption: 'جميع الفروع العامة',
    filterAreaLabel: 'تصفية حسب المنطقة / المركز',
    allAreasOption: 'جميع مناطق هذا الفرع',
    totalVotesLabel: 'إجمالي الأصوات:',
    roundsListTitle: 'قائمة الدورات الانتخابية',
    roundNameHeader: 'اسم الدورة',
    roundDateHeader: 'التاريخ',
    roundTypeHeader: 'النوع',
    roundVotersHeader: 'إجمالي الناخبين',
    actionsHeader: 'الإجراءات',
    editBtn: 'تعديل',
    deleteBtn: 'حذف',
    branchTabTitle: 'تبويب الفروع',
    manageBranchesTitle: 'إدارة فروع:',
    newBranchPlaceholder: 'اسم الفرع الجديد...',
    addBranchBtn: '+ إضافة فرع جديد',
    updateBtn: 'تحديث',
    cancelBtn: 'إلغاء',
    subTabRegions: 'تبويب فرعي للمناطق',
    regionManagementTitle: 'المناطق التابعة للفرع',
    newRegionPlaceholder: 'اسم المنطقة/المركز...',
    addRegionBtn: '+ إضافة منطقة',
    noRegionsWarning: '⚠️ لا توجد مناطق لهذا الفرع، يمكنك إدخال الأصوات مباشرة هنا:',
    directBranchEntry: '📋 إدخال أصوات الأحزاب مباشرة على مستوى الفرع',
    selectedBranchBadge: 'الفرع المحدد',
    votesCountLabel: 'عدد الأصوات:',
    percentageLabel: 'النسبة المئوية:',
    controlPanelTitle: 'لوحة تحكم الحسابات',
    controlPanelSubtitle: 'إنشاء حسابات جديدة للفروع أو المراقبين',
    fullNameLabel: 'الاسم الكامل / المركز',
    roleLabel: 'دور المستخدم',
    branchAdminRole: 'مدير الفرع',
    viewerRole: 'مشاهد',
    selectBranchPlaceholder: '-- اختر الفرع المستهدف --',
    createAccountBtn: '+ إنشاء حساب',
    accountsListTitle: 'قائمة جميع الحسابات وعرض/تغيير كلمات المرور الخاصة بهم في قاعدة البيانات',
    passwordDbHeader: 'كلمة المرور (قاعدة البيانات)',
    linkedBranchHeader: 'الفرع المرتبط',
    generalOrNone: 'لا يوجد / عام',
    changeMyPasswordTitle: 'تغيير كلمة المرور الخاصة بي',
    changeMyPasswordSubtitle: 'يمكن لمدير الفرع تغيير كلمة المرور الخاصة به هنا وتحديثها في قاعدة البيانات',
    newPasswordLabel: 'كلمة المرور الجديدة',
    saveNewPasswordBtn: 'حفظ كلمة المرور الجديدة في قاعدة البيانات',
  },
  fa: {
    loginTitle: 'ورود به سیستم',
    loginSubtitle: 'لطفاً مشخصات کاربری خود را وارد کنید',
    username: 'نام کاربری',
    password: 'رمز عبور',
    rememberMe: 'مرا به خاطر بسپار',
    forgotPassword: 'رمز عبور را فراموش کرده اید؟',
    loginBtn: 'ورود',
    systemTitle: 'سیستم تجزیه و تحلیل نتایج انتخابات',
    userLabel: 'کاربر:',
    superAdmin: 'مدیر کل',
    branchAdmin: 'مدیر شعبه',
    viewer: 'ناظر',
    themeLabel: 'پوسته:',
    governmentTheme: '🏛️ دولتی',
    darkTheme: '🌙 تاریک',
    lightTheme: '☀️ روشن',
    logout: 'خروج',
    mainSections: 'بخش های اصلی',
    dashboardTab: 'داشبورد و نمودارها',
    roundsTab: 'دوره های انتخابات',
    controlPanelTab: 'کنترل پنل و حساب‌ها',
    myPasswordTab: 'تغییر رمز عبور من',
    dashboardHeading: 'داشبورد و تجزیه و تحلیل نتایج',
    selectedRound: 'دوره انتخاب شده:',
    noRoundSelected: 'هیچ دوره ای انتخاب نشده است',
    chartTypeLabel: 'نوع نمودار:',
    selectRoundPrompt: 'انتخاب دوره انتخابات برای مشاهده نمودارها:',
    noRoundsWarning: 'لطفاً ابتدا از بخش "دوره های انتخابات" یک دوره اضافه کنید.',
    filterBranchLabel: 'فیلتر بر اساس شعبه انتخابات',
    allBranchesOption: 'همه شعب کلی',
    filterAreaLabel: 'فیلتر بر اساس منطقه / مرکز',
    allAreasOption: 'همه مناطق این شعبه',
    totalVotesLabel: 'مجموع آرا:',
    roundsListTitle: 'لیست دوره های انتخابات',
    roundNameHeader: 'نام دوره',
    roundDateHeader: 'تاریخ',
    roundTypeHeader: 'نوع',
    roundVotersHeader: 'مجموع رأی دهندگان',
    actionsHeader: 'عملیات',
    editBtn: 'ویرایش',
    deleteBtn: 'حذف',
    branchTabTitle: 'تب شعب',
    manageBranchesTitle: 'مدیریت شعب:',
    newBranchPlaceholder: 'نام شعبه جدید...',
    addBranchBtn: '+ افزودن شعبه جدید',
    updateBtn: 'بروزرسانی',
    cancelBtn: 'لغو',
    subTabRegions: 'تب فرعی مناطق',
    regionManagementTitle: 'مناطق متعلق به شعبه',
    newRegionPlaceholder: 'نام منطقه/مرکز...',
    addRegionBtn: '+ افزودن منطقه',
    noRegionsWarning: '⚠️ هیچ منطقه ای برای این شعبه وجود ندارد، می توانید آرا را مستقیماً از اینجا وارد کنید:',
    directBranchEntry: '📋 ورود مستقیم آرای احزاب در سطح شعبه',
    selectedBranchBadge: 'شعبه انتخاب شده',
    votesCountLabel: 'تعداد آرا:',
    percentageLabel: 'درصد:',
    controlPanelTitle: 'کنترل پنل حساب ها',
    controlPanelSubtitle: 'ایجاد حساب های جدید برای شعب یا ناظران',
    fullNameLabel: 'نام کامل / مرکز',
    roleLabel: 'نقش کاربر',
    branchAdminRole: 'مدیر شعبه',
    viewerRole: 'ناظر',
    selectBranchPlaceholder: '-- شعبه مورد نظر را انتخاب کنید --',
    createAccountBtn: '+ ایجاد حساب',
    accountsListTitle: 'لیست تمام حساب ها و مشاهده/تغییر رمز عبور آنها در پایگاه داده',
    passwordDbHeader: 'رمز عبور (پایگاه داده)',
    linkedBranchHeader: 'شعبه مرتبط',
    generalOrNone: 'هیچ / کلی',
    changeMyPasswordTitle: 'تغییر رمز عبور من',
    changeMyPasswordSubtitle: 'مدیر شعبه می تواند رمز عبور خود را در اینجا تغییر دهد و در پایگاه داده بروزرسانی کند',
    newPasswordLabel: 'رمز عبور جدید',
    saveNewPasswordBtn: 'ذخیره رمز عبور جدید در پایگاه داده',
  }
};

export function App() {
  const [lang, setLang] = useState<LanguageType>('ckb');
  const t = translations[lang];

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('election_users_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, username: 'admin', password: '123456', role: 'super_admin', name: 'بەڕێوەبەری گشتی' }
    ];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('election_current_user_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!currentUser);
  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccRole, setNewAccRole] = useState<UserRole>('branch_admin');
  const [newAccBranchId, setNewAccBranchId] = useState<number | null>(null);
  const [accSuccessMsg, setAccSuccessMsg] = useState('');

  const [selfNewPassword, setSelfNewPassword] = useState('');
  const [selfPasswordMsg, setSelfPasswordMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('election_users_v4', JSON.stringify(users));
    if (currentUser) {
      const latestMe = users.find(u => u.id === currentUser.id);
      if (latestMe) {
        setCurrentUser(latestMe);
      }
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('election_current_user_v4', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('election_current_user_v4');
    }
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const foundUser = users.find(u => u.username.trim().toLowerCase() === username.trim().toLowerCase() && u.password === password);

    if (foundUser) {
      setCurrentUser(foundUser);
      setIsLoggedIn(true);
      if (rememberMe) {
        localStorage.setItem('election_saved_username', username);
      } else {
        localStorage.removeItem('election_saved_username');
      }
    } else {
      setLoginError(lang === 'ckb' ? 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە! تکایە دڵنیابەوە لە زانیارییەکان.' : 'Invalid username or password! Please check your credentials.');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccSuccessMsg('');
    setLoginError('');

    if (!newAccUsername || !newAccPassword || !newAccName) {
      setLoginError('تکایە هەموو خانە پێویستەکان پڕبکەرەوە بۆ دروستکردنی ئەکاونت.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === newAccUsername.toLowerCase())) {
      setLoginError('ئەم ناوی بەکارهێنەرە پێشتر هەیە، تکایە یوزەرنەیمێکی تر بەکاربهێنە!');
      return;
    }

    const newUser: UserAccount = {
      id: Date.now(),
      username: newAccUsername.trim(),
      password: newAccPassword,
      name: newAccName.trim(),
      role: newAccRole,
      branchId: (newAccRole === 'branch_admin' || newAccRole === 'viewer') ? Number(newAccBranchId) || null : null
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    setAccSuccessMsg('ئەکاونتەکە بە سەرکەوتوویی دروستکرا و تۆمارکرا لە داتابەیسدا!');
    setNewAccUsername('');
    setNewAccPassword('');
    setNewAccName('');
    setNewAccBranchId(null);
  };

  const handleDeleteUser = (id: number) => {
    if (id === 1) return; 
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
  };

  const handleUpdateMyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSelfPasswordMsg('');
    if (!selfNewPassword) return;

    if (currentUser) {
      const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: selfNewPassword } : u);
      setUsers(updatedUsers);
      setSelfPasswordMsg('پاسوۆردەکەت بە سەرکەوتوویی گۆڕدرا و لە داتابەیس نوێکرایەوە!');
      setSelfNewPassword('');
    }
  };

  const handleAdminUpdateUserPassword = (userId: number, newPass: string) => {
    if (!newPass) return;
    const updatedUsers = users.map(u => u.id === userId ? { ...u, password: newPass } : u);
    setUsers(updatedUsers);
    alert('پاسوۆردی ئەم بەکارهێنەرە بە سەرکەوتوویی نوێکرایەوە!');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = "behman4kurd@gmail.com";

    if (recoveryEmail.trim().toLowerCase() === targetEmail) {
      setRecoveryMessage('پاسۆردی نوێ بە سەرکەوتوویی نێردرا بۆ ئیمەیڵەکەت: ' + targetEmail);
      setLoginError('');
    } else {
      setLoginError('ئەم ئیمەیڵە ناسراو نییە! تکایە (bahman4kurd@gmail.com) بنووسە.');
      setRecoveryMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('election_saved_username');
    localStorage.removeItem('election_current_user_v4');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setAuthView('login');
  };

  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'rounds' | 'controlPanel'>('dashboard');
  const [theme, setTheme] = useState<ThemeType>('government');

  const [rounds, setRounds] = useState<ElectionRound[]>(() => {
    try {
      const saved = localStorage.getItem('election_rounds_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('election_selected_round_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundType, setRoundType] = useState('پەرلەمانی');
  const [roundVoters, setRoundVoters] = useState('');
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);

  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('election_branches_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('election_selected_branch_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);

  const [regions, setRegions] = useState<Region[]>(() => {
    try {
      const saved = localStorage.getItem('election_regions_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [newRegionName, setNewRegionName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('election_selected_region_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [editingRegionId, setEditingRegionId] = useState<number | null>(null);

  const [regionVotes, setRegionVotes] = useState<{ [regionId: number]: PartyVote[] }>(() => {
    try {
      const saved = localStorage.getItem('election_region_votes_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [branchVotes, setBranchVotes] = useState<{ [branchId: number]: PartyVote[] }>(() => {
    try {
      const saved = localStorage.getItem('election_branch_votes_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [dashboardChartType, setDashboardChartType] = useState<ChartType>('donut');
  const [dashSelectedBranch, setDashSelectedBranch] = useState<string>('all');
  const [dashSelectedRegion, setDashSelectedRegion] = useState<string>('all');
  const [dashSelectedRoundId, setDashSelectedRoundId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('election_dash_round_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const defaultParties = [
    { partyId: 1, partyName: 'پارتی دیموکراتی کوردستان', color: 'bg-yellow-500', hexColor: '#eab308' },
    { partyId: 2, partyName: 'یەکێتی نیشتمانی کوردستان', color: 'bg-green-600', hexColor: '#16a34a' },
    { partyId: 3, partyName: 'نەوەی نوێ', color: 'bg-orange-500', hexColor: '#f97316' },
    { partyId: 4, partyName: 'یەکگرتووی ئیسلامی کوردستان', color: 'bg-amber-900', hexColor: '#78350f' },
    { partyId: 5, partyName: 'کۆمەڵی دادگەری', color: 'bg-orange-800', hexColor: '#9a3412' },
    { partyId: 6, partyName: 'هەڵوێست', color: 'bg-purple-600', hexColor: '#9333ea' },
    { partyId: 7, partyName: 'بزووتنەوەی گۆڕان', color: 'bg-blue-900', hexColor: '#1e3a8a' },
    { partyId: 8, partyName: 'بزووتنەوەی ئیسلامی', color: 'bg-slate-500', hexColor: '#64748b' },
    { partyId: 9, partyName: 'سۆسیالیست', color: 'bg-sky-400', hexColor: '#38bdf8' },
    { partyId: 10, partyName: 'هاوپەیمانی نیشتمانی', color: 'bg-emerald-400', hexColor: '#34d399' },
    { partyId: 11, partyName: 'سەربەخۆ', color: 'bg-teal-400', hexColor: '#2dd4bf' },
    { partyId: 12, partyName: 'لایەنی تر', color: 'bg-rose-500', hexColor: '#f43f5e' },
  ];

  useEffect(() => {
    localStorage.setItem('election_rounds_v4', JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    localStorage.setItem('election_branches_v4', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('election_regions_v4', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('election_region_votes_v4', JSON.stringify(regionVotes));
  }, [regionVotes]);

  useEffect(() => {
    localStorage.setItem('election_branch_votes_v4', JSON.stringify(branchVotes));
  }, [branchVotes]);

  useEffect(() => {
    if (selectedRoundId !== null) {
      localStorage.setItem('election_selected_round_v4', JSON.stringify(selectedRoundId));
    }
  }, [selectedRoundId]);

  useEffect(() => {
    if (dashSelectedRoundId !== null) {
      localStorage.setItem('election_dash_round_v4', JSON.stringify(dashSelectedRoundId));
    }
  }, [dashSelectedRoundId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'branch_admin' && currentUser.branchId) {
      setSelectedBranchId(currentUser.branchId);
      const targetBranch = branches.find(b => b.id === currentUser.branchId);
      if (targetBranch) {
        setDashSelectedBranch(targetBranch.id.toString());
        setDashSelectedRoundId(targetBranch.roundId);
        setSelectedRoundId(targetBranch.roundId);
      }
    }
  }, [currentUser, branches]);

  useEffect(() => {
    if (rounds.length > 0 && (!dashSelectedRoundId || !rounds.some(r => r.id === dashSelectedRoundId))) {
      setDashSelectedRoundId(rounds[0].id);
    }
    if (rounds.length > 0 && (!selectedRoundId || !rounds.some(r => r.id === selectedRoundId))) {
      setSelectedRoundId(rounds[0].id);
    }
  }, [rounds]);

  const handleSaveRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') return;
    if (!roundName || !roundDate) return;

    if (editingRoundId !== null) {
      setRounds(rounds.map(r => r.id === editingRoundId ? {
        ...r,
        name: roundName,
        date: roundDate,
        type: roundType,
        totalVoters: Number(roundVoters) || r.totalVoters
      } : r));
      setEditingRoundId(null);
    } else {
      const newRound: ElectionRound = {
        id: Date.now(),
        name: roundName,
        date: roundDate,
        type: roundType,
        totalVoters: Number(roundVoters) || 100000,
        status: 'چالاک'
      };
      setRounds([...rounds, newRound]);
      setSelectedRoundId(newRound.id);
      setDashSelectedRoundId(newRound.id);
    }
    setRoundName('');
    setRoundDate('');
    setRoundVoters('');
  };

  const handleEditRound = (r: ElectionRound) => {
    if (currentUser?.role !== 'super_admin') return;
    setEditingRoundId(r.id);
    setRoundName(r.name);
    setRoundDate(r.date);
    setRoundType(r.type);
    setRoundVoters(r.totalVoters.toString());
  };

  const handleDeleteRound = (id: number) => {
    if (currentUser?.role !== 'super_admin') return;
    setRounds(rounds.filter(r => r.id !== id));
    if (selectedRoundId === id) setSelectedRoundId(null);
    if (dashSelectedRoundId === id) setDashSelectedRoundId(null);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') return;
    if (!newBranchName || !selectedRoundId) return;

    if (editingBranchId !== null) {
      setBranches(branches.map(b => b.id === editingBranchId ? { ...b, name: newBranchName } : b));
      setEditingBranchId(null);
    } else {
      const newB: Branch = { id: Date.now(), roundId: selectedRoundId, name: newBranchName };
      setBranches([...branches, newB]);
      setSelectedBranchId(newB.id);

      setBranchVotes(prev => ({
        ...prev,
        [newB.id]: defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))
      }));
    }
    setNewBranchName('');
  };

  const handleDeleteBranch = (id: number) => {
    if (currentUser?.role !== 'super_admin') return;
    setBranches(branches.filter(b => b.id !== id));
    if (selectedBranchId === id) setSelectedBranchId(null);
  };

  const handleSaveRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'viewer') return;
    if (!newRegionName || !selectedBranchId) return;

    if (editingRegionId !== null) {
      setRegions(regions.map(reg => reg.id === editingRegionId ? { ...reg, name: newRegionName } : reg));
      setEditingRegionId(null);
    } else {
      const newReg: Region = { id: Date.now(), branchId: selectedBranchId, name: newRegionName };
      setRegions([...regions, newReg]);
      setSelectedRegionId(newReg.id);

      setRegionVotes(prev => ({
        ...prev,
        [newReg.id]: defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))
      }));
    }
    setNewRegionName('');
  };

  const handleDeleteRegion = (id: number) => {
    if (currentUser?.role === 'viewer') return;
    setRegions(regions.filter(reg => reg.id !== id));
    if (selectedRegionId === id) setSelectedRegionId(null);
  };

  const handleVoteChange = (regionId: number, partyId: number, votes: number) => {
    if (currentUser?.role === 'viewer') return;
    const currentList = regionVotes[regionId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }));
    
    const updated = currentList.map(item => {
      const v = item.partyId === partyId ? votes : item.votes;
      return { ...item, votes: v };
    });

    const totalVotes = updated.reduce((acc, curr) => acc + curr.votes, 0);

    const recalculated = updated.map(item => ({
      ...item,
      percentage: totalVotes > 0 ? Number(((item.votes / totalVotes) * 100).toFixed(1)) : 0
    }));

    setRegionVotes({
      ...regionVotes,
      [regionId]: recalculated
    });
  };

  const handleBranchVoteChange = (branchId: number, partyId: number, votes: number) => {
    if (currentUser?.role === 'viewer') return;
    const currentList = branchVotes[branchId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }));
    
    const updated = currentList.map(item => {
      const v = item.partyId === partyId ? votes : item.votes;
      return { ...item, votes: v };
    });

    const totalVotes = updated.reduce((acc, curr) => acc + curr.votes, 0);

    const recalculated = updated.map(item => ({
      ...item,
      percentage: totalVotes > 0 ? Number(((item.votes / totalVotes) * 100).toFixed(1)) : 0
    }));

    setBranchVotes({
      ...branchVotes,
      [branchId]: recalculated
    });
  };

  const getFilteredDashboardVotes = () => {
    if (!dashSelectedRoundId) return [];

    const roundBranches = currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer' 
      ? branches.filter(b => b.roundId === dashSelectedRoundId && b.id === currentUser.branchId)
      : branches.filter(b => b.roundId === dashSelectedRoundId);

    let targetBranchIds: number[] = [];

    if (dashSelectedBranch === 'all') {
      targetBranchIds = roundBranches.map(b => b.id);
    } else {
      targetBranchIds = [Number(dashSelectedBranch)];
    }

    const aggregated: { [partyId: number]: { partyName: string; votes: number; hexColor: string; color: string } } = {};
    
    defaultParties.forEach(p => {
      aggregated[p.partyId] = { partyName: p.partyName, votes: 0, hexColor: p.hexColor, color: p.color };
    });

    targetBranchIds.forEach(bId => {
      const branchRegions = regions.filter(reg => reg.branchId === bId);
      
      if (branchRegions.length > 0) {
        branchRegions.forEach(reg => {
          const vList = regionVotes[reg.id] || [];
          vList.forEach(item => {
            if (aggregated[item.partyId]) {
              aggregated[item.partyId].votes += item.votes;
            }
          });
        });
      } else {
        const bList = branchVotes[bId] || [];
        bList.forEach(item => {
          if (aggregated[item.partyId]) {
            aggregated[item.partyId].votes += item.votes;
          }
        });
      }
    });

    const totalAllVotes = Object.values(aggregated).reduce((sum, item) => sum + item.votes, 0);

    return Object.values(aggregated).map(item => ({
      ...item,
      percentage: totalAllVotes > 0 ? Number(((item.votes / totalAllVotes) * 100).toFixed(1)) : 0
    }));
  };

  const createSvgSlices = (data: { partyName: string; votes: number; percentage: number; hexColor: string }[], isDonut: boolean) => {
    const totalVotes = data.reduce((acc, curr) => acc + curr.votes, 0);
    if (totalVotes === 0) {
      return (
        <circle cx="50" cy="50" r="40" fill="none" stroke="#cbd5e1" strokeWidth={isDonut ? "20" : "40"} />
      );
    }

    let accumulatedAngle = 0;
    const radius = 42;
    const center = 50;

    return data.map((item, index) => {
      if (item.votes <= 0) return null;

      const percentage = item.votes / totalVotes;
      const angle = percentage * 360;
      
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      let pathData = '';
      if (Math.abs(angle - 360) < 0.1) {
        return (
          <circle key={index} cx={center} cy={center} r={radius} fill="none" stroke={item.hexColor} strokeWidth={isDonut ? "22" : "84"} />
        );
      } else if (isDonut) {
        const innerRadius = 24;
        const ix1 = center + innerRadius * Math.cos((Math.PI * startAngle) / 180);
        const iy1 = center + innerRadius * Math.sin((Math.PI * startAngle) / 180);
        const ix2 = center + innerRadius * Math.cos((Math.PI * endAngle) / 180);
        const iy2 = center + innerRadius * Math.sin((Math.PI * endAngle) / 180);

        pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
      } else {
        pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      }

      const midAngle = startAngle + angle / 2;
      const labelRadius = isDonut ? 33 : 28;
      const labelX = center + labelRadius * Math.cos((Math.PI * midAngle) / 180);
      const labelY = center + labelRadius * Math.sin((Math.PI * midAngle) / 180);

      return (
        <g key={index}>
          <path d={pathData} fill={item.hexColor} className="transition-all duration-300 hover:opacity-85 cursor-pointer" />
          {item.percentage >= 4 && (
            <text 
              x={labelX} 
              y={labelY} 
              fill="#fff" 
              fontSize="4" 
              fontWeight="bold" 
              textAnchor="middle" 
              dominantBaseline="central"
              className="pointer-events-none drop-shadow"
            >
              {item.percentage}%
            </text>
          )}
        </g>
      );
    });
  };

  const currentRound = rounds.find(r => r.id === selectedRoundId);
  const currentBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId
    ? branches.filter(b => b.roundId === selectedRoundId && b.id === currentUser.branchId)
    : branches.filter(b => b.roundId === selectedRoundId);

  const currentRegions = regions.filter(reg => reg.branchId === selectedBranchId);
  const currentRegionVotes = selectedRegionId ? (regionVotes[selectedRegionId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))) : [];
  const currentBranchVotes = selectedBranchId ? (branchVotes[selectedBranchId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))) : [];

  const dashFilteredBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId
    ? branches.filter(b => b.roundId === dashSelectedRoundId && b.id === currentUser.branchId)
    : dashSelectedRoundId ? branches.filter(b => b.roundId === dashSelectedRoundId) : [];

  const dashFilteredRegions = dashSelectedBranch !== 'all' ? regions.filter(reg => reg.branchId === Number(dashSelectedBranch)) : [];
  const dashboardData = getFilteredDashboardVotes();
  const totalDashboardVotes = dashboardData.reduce((acc, curr) => acc + curr.votes, 0);
  const dashSelectedRoundObj = rounds.find(r => r.id === dashSelectedRoundId);

  const getDir = () => (lang === 'en' ? 'ltr' : 'rtl');

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] p-4" dir={getDir()}>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
          
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-2 py-1 shadow-sm">
            <Globe className="w-4 h-4 text-blue-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageType)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ckb">کوردی (سۆرانی)</option>
              <option value="kmr">کوردی (کرمانجی)</option>
              <option value="en">English</option>
              <option value="ar">عربي</option>
              <option value="fa">فارسی</option>
            </select>
          </div>

          {authView === 'login' && (
            <>
              <div className="text-center mb-6 pt-4">
                <div className="inline-flex p-3 bg-blue-600/20 text-blue-500 rounded-full mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">{t.loginTitle}</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{t.loginSubtitle}</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.username}</label>
                  <div className="relative">
                    <User className={`absolute ${lang === 'en' ? 'left-3' : 'right-3'} top-3 w-5 h-5 text-gray-400`} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl ${lang === 'en' ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="admin"
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.password}</label>
                  <div className="relative">
                    <Lock className={`absolute ${lang === 'en' ? 'left-3' : 'right-3'} top-3 w-5 h-5 text-gray-400`} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl ${lang === 'en' ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="123456"
                      required 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)]">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-[var(--bg-main)] text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t.rememberMe}</span>
                  </label>

                  <button 
                    type="button" 
                    onClick={() => { setAuthView('forgot'); setLoginError(''); }}
                    className="text-blue-500 hover:underline text-xs font-medium"
                  >
                    {t.forgotPassword}
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition duration-200 shadow-lg shadow-blue-600/20"
                >
                  {t.loginBtn}
                </button>
              </form>
            </>
          )}

          {authView === 'forgot' && (
            <>
              <div className="text-center mb-6 pt-4">
                <div className="inline-flex p-3 bg-amber-600/20 text-amber-500 rounded-full mb-3">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">گەڕاندنەوەی پاسۆرد</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">ئیمەیڵی پەیوەندیدار بنووسە (behman4kurd@gmail.com)</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm">
                  {loginError}
                </div>
              )}

              {recoveryMessage && (
                <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">
                  {recoveryMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">ناونیشانی ئیمەیڵ</label>
                  <div className="relative">
                    <Mail className={`absolute ${lang === 'en' ? 'left-3' : 'right-3'} top-3 w-5 h-5 text-gray-400`} />
                    <input 
                      type="email" 
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className={`w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl ${lang === 'en' ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="behman4kurd@gmail.com"
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl text-sm transition duration-200"
                >
                  ناردنی پاسۆرد بۆ ئیمەیڵ
                </button>

                <button 
                  type="button" 
                  onClick={() => { setAuthView('login'); setLoginError(''); setRecoveryMessage(''); }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl text-sm transition duration-200"
                >
                  گەڕانەوە بۆ پەڕەی لۆگین
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200" dir={getDir()}>
      <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            📊
          </div>
          <div>
            <h1 className="text-base font-bold">{t.systemTitle}</h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {t.userLabel} <span className="font-bold text-blue-500">{currentUser.name}</span> ({currentUser.role === 'super_admin' ? t.superAdmin : currentUser.role === 'branch_admin' ? t.branchAdmin : t.viewer})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg shadow-sm">
            <Globe className="w-4 h-4 text-blue-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageType)}
              className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ckb">کوردی (سۆرانی)</option>
              <option value="kmr">کوردی (کرمانجی)</option>
              <option value="en">English</option>
              <option value="ar">عربي</option>
              <option value="fa">فارسی</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)] font-medium">{t.themeLabel}</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none"
            >
              <option value="government">{t.governmentTheme}</option>
              <option value="dark">{t.darkTheme}</option>
              <option value="light">{t.lightTheme}</option>
            </select>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition border border-red-800/40"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[var(--bg-card)] border-e border-[var(--border-color)] p-4 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-1">
            {t.mainSections}
          </span>

          <button
            onClick={() => setActiveMainTab('dashboard')}
            className={`w-full text-start px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
              activeMainTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>{t.dashboardTab}</span>
            <span>🏠</span>
          </button>

          <button
            onClick={() => setActiveMainTab('rounds')}
            className={`w-full text-start px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
              activeMainTab === 'rounds' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>{t.roundsTab}</span>
            <span>🗳️</span>
          </button>

          {currentUser.role === 'super_admin' && (
            <button
              onClick={() => setActiveMainTab('controlPanel')}
              className={`w-full text-start px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
                activeMainTab === 'controlPanel' ? 'bg-amber-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span>{t.controlPanelTab}</span>
              <span>⚙️</span>
            </button>
          )}

          {currentUser.role === 'branch_admin' && (
            <button
              onClick={() => setActiveMainTab('controlPanel')}
              className={`w-full text-start px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
                activeMainTab === 'controlPanel' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span>{t.myPasswordTab}</span>
              <span>🔑</span>
            </button>
          )}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeMainTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-color)] pb-4">
                  <div>
                    <h2 className="text-xl font-bold">{t.dashboardHeading}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {t.selectedRound} <span className="font-bold text-blue-600">{dashSelectedRoundObj ? dashSelectedRoundObj.name : t.noRoundSelected}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">{t.chartTypeLabel}</label>
                    <select
                      value={dashboardChartType}
                      onChange={(e) => setDashboardChartType(e.target.value as ChartType)}
                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bars">📊 هێڵکاری ستوونی (Bar Chart)</option>
                      <option value="pie">🥧 هێڵکاری بازنەیی (Pie Chart)</option>
                      <option value="donut">🍩 هێڵکاری دۆنات (Donut Chart)</option>
                      <option value="progress">📈 پیشاندەری ڕێژەیی (Progress Bars)</option>
                      <option value="line">📉 هێڵکاری گەشەسەندن (Line Chart)</option>
                      <option value="network">🕸️ هێڵکاری تۆڕی پێشکەوتوو (Network Nodes)</option>
                      <option value="radial">🎯 هێڵکاری پەیڤەری و تیشکی (Radial Gauge)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">{t.selectRoundPrompt}</span>
                  <div className="flex flex-wrap gap-2">
                    {rounds.length === 0 ? (
                      <span className="text-sm text-red-500 font-medium">{t.noRoundsWarning}</span>
                    ) : (
                      rounds.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setDashSelectedRoundId(r.id);
                            if (currentUser.role !== 'branch_admin' && currentUser.role !== 'viewer') setDashSelectedBranch('all');
                            setDashSelectedRegion('all');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                            dashSelectedRoundId === r.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow'
                              : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          {r.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.filterBranchLabel}</label>
                    <select
                      value={dashSelectedBranch}
                      onChange={(e) => {
                        setDashSelectedBranch(e.target.value);
                        setDashSelectedRegion('all');
                      }}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                      disabled={currentUser.role === 'branch_admin' || currentUser.role === 'viewer'}
                    >
                      {currentUser.role !== 'branch_admin' && currentUser.role !== 'viewer' && <option value="all">{t.allBranchesOption}</option>}
                      {dashFilteredBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.filterAreaLabel}</label>
                    <select
                      value={dashSelectedRegion}
                      onChange={(e) => setDashSelectedRegion(e.target.value)}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                      disabled={dashSelectedBranch === 'all'}
                    >
                      <option value="all">{t.allAreasOption}</option>
                      {dashFilteredRegions.map(reg => (
                        <option key={reg.id} value={reg.id}>{reg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                  <h3 className="text-lg font-bold">
                    {t.dashboardHeading}: <span className="text-blue-600">{dashSelectedRoundObj?.name || 'هیچ'}</span>
                  </h3>
                  <span className="text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 px-3 py-1 rounded-full">
                    {t.totalVotesLabel} {totalDashboardVotes.toLocaleString()}
                  </span>
                </div>

                {dashboardChartType === 'bars' && (
                  <div className="space-y-4 pt-2">
                    {dashboardData.map(item => (
                      <div key={item.partyName} className="space-y-1">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>{item.partyName}</span>
                          <span>{item.votes.toLocaleString()} دەنگ ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-[var(--bg-main)] h-4 rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                          <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.hexColor }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {dashboardChartType === 'progress' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {dashboardData.map(item => (
                      <div key={item.partyName} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                        <span className="w-4 h-4 rounded-full border border-gray-300 shadow" style={{ backgroundColor: item.hexColor }}></span>
                        <h4 className="font-bold text-sm">{item.partyName}</h4>
                        <div className="text-3xl font-extrabold text-blue-600">{item.percentage}%</div>
                        <p className="text-xs text-[var(--text-secondary)]">{item.votes.toLocaleString()} دەنگ</p>
                      </div>
                    ))}
                  </div>
                )}

                {(dashboardChartType === 'pie' || dashboardChartType === 'donut') && (
                  <div className="flex flex-col xl:flex-row items-center justify-between gap-8 py-4">
                    <div className="relative w-80 h-80 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                        {createSvgSlices(dashboardData, dashboardChartType === 'donut')}
                      </svg>

                      {dashboardChartType === 'donut' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                          <span className="text-xs font-semibold text-[var(--text-secondary)]">کۆی گشتی</span>
                          <span className="text-sm font-extrabold text-[var(--text-primary)]">{totalDashboardVotes.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {dashboardData.map(item => (
                        <div key={item.partyName} className="flex items-center justify-between bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-2.5 rounded-xl shadow-sm text-xs">
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                            <span className="font-semibold truncate" title={item.partyName}>{item.partyName}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-bold text-blue-600">{item.percentage}%</span>
                            <span className="text-[var(--text-secondary)]">({item.votes.toLocaleString()})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardChartType === 'line' && (
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                    <h4 className="font-bold text-sm text-[var(--text-secondary)]">ڕەوتی هێڵی ڕێژەی دەنگەکان</h4>
                    <div className="flex items-end justify-around h-48 pt-6 border-b border-x border-[var(--border-color)] px-2 overflow-x-auto relative gap-2">
                      {dashboardData.map((item) => (
                        <div key={item.partyName} className="flex flex-col items-center gap-2 h-full justify-end group min-w-[60px]">
                          <span className="text-xs font-bold text-blue-600">{item.percentage}%</span>
                          <div
                            className="w-10 rounded-t-lg border border-gray-300 transition-all duration-500 shadow-md group-hover:opacity-90"
                            style={{ height: `${Math.max(item.percentage, 10)}%`, backgroundColor: item.hexColor }}
                          ></div>
                          <span className="text-[10px] font-semibold text-center mt-2 truncate w-full" title={item.partyName}>{item.partyName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardChartType === 'network' && (
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[var(--text-secondary)]">🕸️ پەیوەندی و تۆرکاری دەنگی لایەنەکان</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-md font-bold">چالاک و ڕاستەقینە</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {dashboardData.map((item, idx) => (
                        <div key={item.partyName} className="relative bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] p-5 rounded-2xl flex flex-col items-center text-center gap-3 shadow-sm">
                          <div className={`absolute -top-3 ${lang === 'en' ? 'end-4' : 'start-4'} px-3 py-0.5 text-xs font-bold text-white rounded-full shadow`} style={{ backgroundColor: item.hexColor }}>
                            گرێی #{idx + 1}
                          </div>
                          <span className="w-6 h-6 rounded-full border border-gray-300 animate-pulse mt-2" style={{ backgroundColor: item.hexColor }}></span>
                          <h5 className="font-bold text-sm">{item.partyName}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-extrabold text-blue-600">{item.votes.toLocaleString()}</span>
                            <span className="text-xs text-[var(--text-secondary)]">دەنگ</span>
                          </div>
                          <div className="w-full bg-[var(--bg-main)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                            <div className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: item.hexColor }}></div>
                          </div>
                          <span className="text-xs font-bold text-[var(--text-secondary)]">پشکی تۆڕ: {item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardChartType === 'radial' && (
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                    <h4 className="font-bold text-sm text-[var(--text-secondary)]">🎯 پەیڤەری پێوانەیی تیشکی و بازنەیی</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {dashboardData.map(item => (
                        <div key={item.partyName} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: item.hexColor }}></span>
                          <h5 className="font-bold text-sm">{item.partyName}</h5>
                          <div className="relative w-32 h-32 rounded-full border-8 border-[var(--border-color)] flex items-center justify-center shadow-inner">
                            <div className="absolute inset-0 rounded-full border-8 opacity-30" style={{ borderColor: item.hexColor }}></div>
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-extrabold">{item.percentage}%</span>
                              <span className="text-[10px] text-[var(--text-secondary)]">ڕێژەی کێبڕکێ</span>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-[var(--text-secondary)]">{item.votes.toLocaleString()} دەنگی بەدەستهاتوو</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMainTab === 'rounds' && (
            <div className="space-y-6">
              {currentUser.role === 'super_admin' && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="text-xl font-bold">
                    {editingRoundId !== null ? 'دەستکاری خولی هەڵبژاردن' : 'تۆمارکردنی خولی نوێ بۆ هەڵبژاردن'}
                  </h2>
                  <form onSubmit={handleSaveRound} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ناوی خولی هەڵبژاردن</label>
                      <input
                        type="text"
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        placeholder="بۆ نموونە: هەڵبژاردنی پەرلەمانی کوردستان"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ڕۆژ و مانگ و ساڵی هەڵبژاردن</label>
                      <input
                        type="date"
                        value={roundDate}
                        onChange={(e) => setRoundDate(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">جۆری هەڵبژاردنەکان</label>
                      <select
                        value={roundType}
                        onChange={(e) => setRoundType(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="پەرلەمانی">پەرلەمانی</option>
                        <option value="ئەنجومەنی پارێزگاکان">ئەنجومەنی پارێزگاکان</option>
                        <option value="سەرۆکایەتی">سەرۆکایەتی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">کۆی دەنگدەران</label>
                      <input
                        type="number"
                        value={roundVoters}
                        onChange={(e) => setRoundVoters(e.target.value)}
                        placeholder="3000000"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-4 flex justify-end gap-2">
                      {editingRoundId !== null && (
                        <button
                          type="button"
                          onClick={() => { setEditingRoundId(null); setRoundName(''); setRoundDate(''); }}
                          className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                        >
                          {t.cancelBtn}
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow transition-all"
                      >
                        {editingRoundId !== null ? t.updateBtn : '+ زیادکردنی خول'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">{t.roundsListTitle}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                        <th className="py-3 px-4">{t.roundNameHeader}</th>
                        <th className="py-3 px-4">{t.roundDateHeader}</th>
                        <th className="py-3 px-4">{t.roundTypeHeader}</th>
                        <th className="py-3 px-4">{t.roundVotersHeader}</th>
                        {currentUser.role === 'super_admin' && <th className="py-3 px-4">{t.actionsHeader}</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-sm">
                      {rounds.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[var(--text-secondary)]">هیچ خولێک تۆمار نەکراوە.</td>
                        </tr>
                      ) : (
                        rounds.map((r) => (
                          <tr key={r.id} className={`hover:bg-[var(--bg-hover)] cursor-pointer ${selectedRoundId === r.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`} onClick={() => setSelectedRoundId(r.id)}>
                            <td className="py-3 px-4 font-semibold">{r.name}</td>
                            <td className="py-3 px-4">{r.date}</td>
                            <td className="py-3 px-4">{r.type}</td>
                            <td className="py-3 px-4">{r.totalVoters.toLocaleString()}</td>
                            {currentUser.role === 'super_admin' && (
                              <td className="py-3 px-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleEditRound(r)} className="text-blue-600 hover:underline text-xs font-bold">{t.editBtn}</button>
                                <button onClick={() => handleDeleteRound(r.id)} className="text-red-600 hover:underline text-xs font-bold">{t.deleteBtn}</button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRoundId && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs text-blue-600 font-bold px-2.5 py-1 bg-blue-100 rounded-full">{t.branchTabTitle}</span>
                      <h2 className="text-xl font-bold mt-2">{t.manageBranchesTitle} {currentRound?.name}</h2>
                    </div>
                    {currentUser.role === 'super_admin' && (
                      <form onSubmit={handleSaveBranch} className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          placeholder={t.newBranchPlaceholder}
                          className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm"
                          required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                          {editingBranchId !== null ? t.updateBtn : t.addBranchBtn}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* لیستی تابەکانی لقەکان کە ئایکۆنی Edit و Delete یان لەسەرە */}
                  <div className="flex flex-wrap gap-2">
                    {currentBranches.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">هیچ لقی بۆ ئەم خولە بەردەست نییە یان بۆت دیاری نەکراوە.</p>
                    ) : (
                      currentBranches.map(branch => (
                        <div
                          key={branch.id}
                          onClick={() => {
                            setSelectedBranchId(branch.id);
                            setSelectedRegionId(null);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border flex items-center gap-3 transition-all ${
                            selectedBranchId === branch.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          <span>{branch.name}</span>
                          {currentUser.role === 'super_admin' && (
                            <div className="flex items-center gap-1.5 ms-1 border-s ps-2 border-current/20" onClick={(e) => e.stopPropagation()}>
                              <button 
                                title="دەستکاری"
                                onClick={() => { setEditingBranchId(branch.id); setNewBranchName(branch.name); }} 
                                className="text-xs hover:scale-125 transition-transform"
                              >
                                ✏️
                              </button>
                              <button 
                                title="سڕینەوە"
                                onClick={() => handleDeleteBranch(branch.id)} 
                                className="text-xs hover:scale-125 transition-transform"
                              >
                                ❌
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {selectedBranchId && (
                    <div className="mt-6 pt-6 border-t border-[var(--border-color)] space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-xs text-green-600 font-bold px-2.5 py-1 bg-green-100 rounded-full">{t.subTabRegions}</span>
                          <h3 className="text-lg font-bold mt-2">{t.regionManagementTitle}</h3>
                        </div>
                        {currentUser.role !== 'viewer' && (
                          <form onSubmit={handleSaveRegion} className="flex gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              value={newRegionName}
                              onChange={(e) => setNewRegionName(e.target.value)}
                              placeholder={t.newRegionPlaceholder}
                              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm"
                              required
                            />
                            <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                              {editingRegionId !== null ? t.updateBtn : t.addRegionBtn}
                            </button>
                          </form>
                        )}
                      </div>

                      {/* لیستی تابەکانی ناوچەکان کە ئایکۆنی Edit و Delete یان لەسەرە */}
                      <div className="flex flex-wrap gap-2">
                        {currentRegions.length === 0 ? (
                          <p className="text-sm text-amber-500 font-medium">{t.noRegionsWarning}</p>
                        ) : (
                          currentRegions.map(reg => (
                            <div
                              key={reg.id}
                              onClick={() => setSelectedRegionId(reg.id)}
                              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border flex items-center gap-2 ${
                                selectedRegionId === reg.id
                                  ? 'bg-green-600 text-white border-green-600 shadow'
                                  : 'bg-[var(--bg-main)] border-[var(--border-color)]'
                              }`}
                            >
                              <span>{reg.name}</span>
                              {currentUser.role !== 'viewer' && (
                                <div className="flex items-center gap-1.5 ms-1 border-s ps-1.5 border-current/20" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    title="دەستکاری"
                                    onClick={() => { setEditingRegionId(reg.id); setNewRegionName(reg.name); }} 
                                    className="hover:scale-125 transition-transform"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    title="سڕینەوە"
                                    onClick={() => handleDeleteRegion(reg.id)} 
                                    className="hover:scale-125 transition-transform"
                                  >
                                    ❌
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {selectedRegionId && (
                        <div className="mt-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
                          <h4 className="font-bold text-base text-[var(--text-primary)]">
                            داتا ئینتری دەنگەکان بۆ ناوچەی دیاریکراو
                          </h4>
                          <div className="space-y-3">
                            {currentRegionVotes.map(party => (
                              <div key={party.partyId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: party.hexColor }}></span>
                                  <span className="font-semibold text-sm">{party.partyName}</span>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--text-secondary)]">{t.votesCountLabel}</label>
                                    <input
                                      type="number"
                                      value={party.votes}
                                      disabled={currentUser.role === 'viewer'}
                                      onChange={(e) => handleVoteChange(selectedRegionId, party.partyId, Number(e.target.value) || 0)}
                                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md px-3 py-1 text-sm w-28 focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--text-secondary)]">{t.percentageLabel}</label>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 rounded-md text-sm font-bold w-20 text-center">
                                      {party.percentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!selectedRegionId || currentRegions.length === 0) && (
                        <div className="mt-6 bg-[var(--bg-main)] border-2 border-blue-500/40 rounded-xl p-5 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-base text-blue-600">
                              {t.directBranchEntry}
                            </h4>
                            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 px-2.5 py-1 rounded-md font-semibold">
                              {t.selectedBranchBadge}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {currentBranchVotes.map(party => (
                              <div key={party.partyId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: party.hexColor }}></span>
                                  <span className="font-semibold text-sm">{party.partyName}</span>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--text-secondary)]">{t.votesCountLabel}</label>
                                    <input
                                      type="number"
                                      value={party.votes}
                                      disabled={currentUser.role === 'viewer'}
                                      onChange={(e) => handleBranchVoteChange(selectedBranchId, party.partyId, Number(e.target.value) || 0)}
                                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md px-3 py-1 text-sm w-28 focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--text-secondary)]">{t.percentageLabel}</label>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 rounded-md text-sm font-bold w-20 text-center">
                                      {party.percentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMainTab === 'controlPanel' && (
            <div className="space-y-6">
              {currentUser.role === 'super_admin' && (
                <>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-[var(--border-color)] pb-3 flex items-center gap-3">
                      <div className="p-2 bg-amber-600/20 text-amber-500 rounded-lg">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{t.controlPanelTitle}</h2>
                        <p className="text-sm text-[var(--text-secondary)]">{t.controlPanelSubtitle}</p>
                      </div>
                    </div>

                    {accSuccessMsg && (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">
                        {accSuccessMsg}
                      </div>
                    )}

                    {loginError && (
                      <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm">
                        {loginError}
                      </div>
                    )}

                    <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.fullNameLabel}</label>
                        <input
                          type="text"
                          value={newAccName}
                          onChange={(e) => setNewAccName(e.target.value)}
                          placeholder="بۆ نموونە: بەرپرسی لقی سلێمانی"
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.username}</label>
                        <input
                          type="text"
                          value={newAccUsername}
                          onChange={(e) => setNewAccUsername(e.target.value)}
                          placeholder="sulaymaniah_admin"
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.password}</label>
                        <input
                          type="text"
                          value={newAccPassword}
                          onChange={(e) => setNewAccPassword(e.target.value)}
                          placeholder="******"
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.roleLabel}</label>
                        <select
                          value={newAccRole}
                          onChange={(e) => setNewAccRole(e.target.value as UserRole)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="branch_admin">{t.branchAdminRole}</option>
                          <option value="viewer">{t.viewerRole}</option>
                        </select>
                      </div>

                      {(newAccRole === 'branch_admin' || newAccRole === 'viewer') && (
                        <div>
                          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">دیاریکردنی لقی پەیوەندیدار</label>
                          <select
                            value={newAccBranchId || ''}
                            onChange={(e) => setNewAccBranchId(Number(e.target.value) || null)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                            required
                          >
                            <option value="">{t.selectBranchPlaceholder}</option>
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                        <button
                          type="submit"
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow transition"
                        >
                          {t.createAccountBtn}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold">{t.accountsListTitle}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-start border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                            <th className="py-3 px-4">{t.fullNameLabel}</th>
                            <th className="py-3 px-4">{t.username}</th>
                            <th className="py-3 px-4">{t.passwordDbHeader}</th>
                            <th className="py-3 px-4">{t.roleLabel}</th>
                            <th className="py-3 px-4">{t.linkedBranchHeader}</th>
                            <th className="py-3 px-4">{t.actionsHeader}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] text-sm">
                          {users.map((u) => {
                            const targetBranch = branches.find(b => b.id === u.branchId);
                            return (
                              <tr key={u.id} className="hover:bg-[var(--bg-hover)]">
                                <td className="py-3 px-4 font-semibold">{u.name}</td>
                                <td className="py-3 px-4">{u.username}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      defaultValue={u.password}
                                      id={`pass_input_${u.id}`}
                                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-2 py-1 text-xs w-24"
                                    />
                                    <button
                                      onClick={() => {
                                        const inputElem = document.getElementById(`pass_input_${u.id}`) as HTMLInputElement;
                                        if (inputElem) handleAdminUpdateUserPassword(u.id, inputElem.value);
                                      }}
                                      className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold"
                                    >
                                      {t.updateBtn}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    u.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                                    u.role === 'branch_admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                  }`}>
                                    {u.role === 'super_admin' ? t.superAdmin : u.role === 'branch_admin' ? t.branchAdmin : t.viewer}
                                  </span>
                                </td>
                                <td className="py-3 px-4">{targetBranch ? targetBranch.name : t.generalOrNone}</td>
                                <td className="py-3 px-4">
                                  {u.id !== 1 && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      className="text-red-600 hover:underline text-xs font-bold"
                                    >
                                      {t.deleteBtn}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {currentUser.role === 'branch_admin' && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
                    <div className="p-2 bg-blue-600/20 text-blue-500 rounded-lg">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t.changeMyPasswordTitle}</h2>
                      <p className="text-sm text-[var(--text-secondary)]">{t.changeMyPasswordSubtitle}</p>
                    </div>
                  </div>

                  {selfPasswordMsg && (
                    <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">
                      {selfPasswordMsg}
                    </div>
                  )}

                  <form onSubmit={handleUpdateMyPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.username}</label>
                      <input
                        type="text"
                        value={currentUser.username}
                        disabled
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t.newPasswordLabel}</label>
                      <input
                        type="text"
                        value={selfNewPassword}
                        onChange={(e) => setSelfNewPassword(e.target.value)}
                        placeholder="پاسوۆردی نوێ بنووسە..."
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow transition"
                    >
                      {t.saveNewPasswordBtn}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;