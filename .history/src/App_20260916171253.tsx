import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  AlertCircle,
  Users,
  Key,
  Globe,
  CheckSquare,
  Square,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

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

interface BranchVoteMetaData {
  validVotes: number;
  invalidVotes: number;
  totalVoters: number;
}

// فەرهەنگی زمانەکان
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
    themeLabel: ' ڕووکار:',
    governmentTheme: '🏛️ حکومی',
    darkTheme: '🌙 تۆخ',
    lightTheme: '☀️  ڕۆشن',
    logout: 'دەرچوون',
    mainSections: 'بەشە سەرەکییەکان',
    dashboardTab: 'داشبۆرد و هێڵکارییەکان',
    roundsTab: 'خولەکانی هەڵبژاردن',
    controlPanelTab: 'پەنێڵی کۆنتڕۆڵ و ئەکاونتەکان',
    reportsTab: 'ڕاپۆرتەکان و پرنت',
    myPasswordTab: 'گۆڕینی پاسوۆردی خۆم',
    dashboardHeading: 'داشبۆرد و شیکاری ئەنجامەکان',
    selectedRound: 'خولە هەڵبژاردراوەکە:',
    noRoundSelected: 'هیچ خولێک دیاری نەکراوە',
    chartTypeLabel: 'جۆری شێوازی چارت:',
    selectRoundPrompt: 'دیاریکردنی خولی هەڵبژاردن بۆ بینینی چارتەکان:',
    noRoundsWarning: 'تکایە سەرەتا لە بەشی "خولەکانی هەڵبژاردن" خولێک زیاد بکە.',
    filterBranchLabel: 'لقی هەڵبژاردن',
    allBranchesOption: 'هەموو لقەکان گشتی',
    filterAreaLabel: 'ناوچە / بنکە',
    allAreasOption: 'هەموو ناوچەکانی لقە هەڵبژاردراوەکان',
    filterPartyLabel: 'دەنگیی  لایەنەکان ',
    selectAllParties: 'دیاریکردنی هەموو لایەنەکان',
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
    reportsTitle: 'ڕاپۆرتی فەرمی و چارت و دەنگی لایەنەکان',
    reportsSubtitle: 'فلتەرکردنی خول، لق و ناوچەکان و چاپکردن یان داونلۆدکردنی بە فایلی PDF',
    printReportBtn: '🖨️ پرنتکردنی ڕاپۆرت و چارت',
    downloadPdfBtn: '📥 داونلۆدکردنی PDF',
    partyNameHeader: 'ناوی لایەن / قەوارە',
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
    reportsTab: 'ڕاپۆرت و چاپ',
    myPasswordTab: 'گوهۆڕینا پاسۆردا خو',
    dashboardHeading: 'داشبۆرد و شیکاریا ئەنجامان',
    selectedRound: 'خولا هەلبژارتی:',
    noRoundSelected: 'چ خول ناتە هറ്റ്‌ هەلبژارتن',
    chartTypeLabel: 'جۆرێ نەخشێ:',
    selectRoundPrompt: 'دیارکرنا خولا هەلبژارتنێ بۆ دیتنا نەخشان:',
    noRoundsWarning: 'تکایە سەرەتا ژ بەشا "خولێن هەلبژارتنێ" خولەکێ زێدە بکە.',
    filterBranchLabel: ' ل دووڤ لقێ هەلبژارتنێ',
    allBranchesOption: 'هەمی لقێن گشتی',
    filterAreaLabel: ' ل دووڤ دەڤەرێ / بنکە',
    allAreasOption: 'هەمی دەڤەرێن ڤی لقێ',
    filterPartyLabel: 'دەنگێن لایەنان',
    selectAllParties: 'دیارکرنا هەمی لایەنان',
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
    reportsTitle: 'ڕاپۆرتا فەرمی و نەخشە و دەنگێن لایەنان',
    reportsSubtitle: 'فلتەرکرنا خول، لق و دەڤەران و چاپکرن یان داونلۆدکرنا PDF',
    printReportBtn: '🖨️ چاپکرنا ڕاپۆرت و نەخشەیی',
    downloadPdfBtn: '📥 داونلۆدکرنا PDF',
    partyNameHeader: 'ناڤێ لایەنێ / قەوارێ',
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
    reportsTab: 'Reports & Print',
    myPasswordTab: 'Change My Password',
    dashboardHeading: 'Dashboard & Results Analysis',
    selectedRound: 'Selected Round:',
    noRoundSelected: 'No round selected',
    chartTypeLabel: 'Chart Type:',
    selectRoundPrompt: 'Select election round to view charts:',
    noRoundsWarning: 'Please first add a round from the "Election Rounds" section.',
    filterBranchLabel: 'Election Branch',
    allBranchesOption: 'All General Branches',
    filterAreaLabel: ' Region / Center',
    allAreasOption: 'All regions of selected branches',
    filterPartyLabel: ' Parties ',
    selectAllParties: 'Select All Parties',
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
    reportsTitle: 'Official Reports & Party Votes',
    reportsSubtitle: 'Filter rounds, branches and regions to print or download as PDF',
    printReportBtn: '🖨️ Print Report & Chart',
    downloadPdfBtn: '📥 Download PDF',
    partyNameHeader: 'Party / Entity Name',
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
    reportsTab: 'التقارير والطباعة',
    myPasswordTab: 'تغيير كلمة المرور الخاصة بي',
    dashboardHeading: 'لوحة القيادة وتحليل النتائج',
    selectedRound: 'الدورة المختارة:',
    noRoundSelected: 'لم يتم اختيار دورة',
    chartTypeLabel: 'نوع الرسم البياني:',
    selectRoundPrompt: 'حدد الدورة الانتخابية لعرض الرسوم البيانية:',
    noRoundsWarning: 'الرجاء إضافة دورة أولاً من قسم "الدورات الانتخابية".',
    filterBranchLabel: ' فرع الانتخابات',
    allBranchesOption: 'جميع الفروع العامة',
    filterAreaLabel: ' المنطقة / المركز',
    allAreasOption: 'جميع مناطق الفروع المحددة',
    filterPartyLabel: 'تصفية الأحزاب',
    selectAllParties: 'تحديد جميع الأحزاب',
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
    reportsTitle: 'التقارير الرسمية وأصوات الأحزاب',
    reportsSubtitle: 'تصفية الدورات والفروع والمناطق للطباعة أو التنزيل بتنسيق PDF',
    printReportBtn: '🖨️ طباعة التقرير والرسم البياني',
    downloadPdfBtn: '📥 تنزيل PDF',
    partyNameHeader: 'اسم الحزب / القائمة',
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
    reportsTab: 'گزارش ها و چاپ',
    myPasswordTab: 'تغییر رمز عبور من',
    dashboardHeading: 'داشبورد و تجزیه و تحلیل نتایج',
    selectedRound: 'دوره انتخاب شده:',
    noRoundSelected: 'هیچ دوره ای انتخاب نشده است',
    chartTypeLabel: 'نوع نمودار:',
    selectRoundPrompt: 'انتخاب دوره انتخابات برای مشاهده نمودارها:',
    noRoundsWarning: 'لطفاً ابتدا از بخش "دوره های انتخابات" یک دوره اضافه کنید.',
    filterBranchLabel: ' اساس شعبه انتخابات',
    allBranchesOption: 'همه شعب کلی',
    filterAreaLabel: ' اساس منطقه / مرکز',
    allAreasOption: 'همه مناطق شعب انتخاب شده',
    filterPartyLabel: 'فیلتر احزاب',
    selectAllParties: 'انتخاب همه احزاب',
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
    reportsTitle: 'گزارش های رسمی و آرای احزاب',
    reportsSubtitle: 'فیلتر دوره‌ها، شعب و مناطق برای چاپ یا دانلود به صورت PDF',
    printReportBtn: '🖨️ چاپ گزارش و نمودار',
    downloadPdfBtn: '📥 دانلود PDF',
    partyNameHeader: 'نام حزب / ائتلاف',
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

  const handleDeleteUser = (id: number) => {
    if (id === 1) return; 
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
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

  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'rounds' | 'controlPanel' | 'reports'>('dashboard');
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

  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('election_branches_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('election_selected_branch_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [regions, setRegions] = useState<Region[]>(() => {
    try {
      const saved = localStorage.getItem('election_regions_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

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

  const [branchMeta, setBranchMeta] = useState<{ [branchId: number]: BranchVoteMetaData }>(() => {
    try {
      const saved = localStorage.getItem('election_branch_meta_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [regionMeta, setRegionMeta] = useState<{ [regionId: number]: BranchVoteMetaData }>(() => {
    try {
      const saved = localStorage.getItem('election_region_meta_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [dashboardChartType, setDashboardChartType] = useState<ChartType>('donut');
  const [dashSelectedBranchIds, setDashSelectedBranchIds] = useState<number[]>([]);
  const [dashSelectedRegionIds, setDashSelectedRegionIds] = useState<number[]>([]);

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

  const [selectedPartyIds, setSelectedPartyIds] = useState<number[]>(defaultParties.map(p => p.partyId));

  useEffect(() => {
    localStorage.setItem('election_rounds_v4', JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getFilteredDashboardVotes = () => {
    if (!dashSelectedRoundId) return [];

    const aggregated: { [partyId: number]: { partyName: string; votes: number; hexColor: string; color: string } } = {};
    let totalValidVotesSum = 0;

    defaultParties.forEach(p => {
      aggregated[p.partyId] = { partyName: p.partyName, votes: 0, hexColor: p.hexColor, color: p.color };
    });

    dashSelectedBranchIds.forEach(bId => {
      const relevantRegions = regions.filter(reg => reg.branchId === bId && (dashSelectedRegionIds.length === 0 || dashSelectedRegionIds.includes(reg.id)));
      
      if (relevantRegions.length > 0) {
        relevantRegions.forEach(reg => {
          const vList = regionVotes[reg.id] || [];
          const rMeta = regionMeta[reg.id];
          const regSum = vList.reduce((s, item) => s + item.votes, 0);
          totalValidVotesSum += (rMeta && rMeta.validVotes > 0) ? rMeta.validVotes : regSum;

          vList.forEach(item => {
            if (aggregated[item.partyId]) {
              aggregated[item.partyId].votes += item.votes;
            }
          });
        });
      } else {
        const bList = branchVotes[bId] || [];
        const bM = branchMeta[bId];
        const bSum = bList.reduce((s, item) => s + item.votes, 0);
        totalValidVotesSum += (bM && bM.validVotes > 0) ? bM.validVotes : bSum;

        bList.forEach(item => {
          if (aggregated[item.partyId]) {
            aggregated[item.partyId].votes += item.votes;
          }
        });
      }
    });

    const totalAllVotes = totalValidVotesSum;

    let results = Object.keys(aggregated).map(idStr => {
      const pId = Number(idStr);
      const item = aggregated[pId];
      return {
        partyId: pId,
        partyName: item.partyName,
        votes: item.votes,
        hexColor: item.hexColor,
        color: item.color,
        percentage: totalAllVotes > 0 ? Number(((item.votes / totalAllVotes) * 100).toFixed(1)) : 0
      };
    });

    results = results.filter(item => selectedPartyIds.includes(item.partyId));

    return results;
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200" dir={getDir()}>
      <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 flex items-center justify-between shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            📊
          </div>
          <div>
            <h1 className="text-base font-bold">{t.systemTitle}</h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {t.userLabel} <span className="font-bold text-blue-500">{currentUser.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        <aside className="w-64 bg-[var(--bg-card)] border-e border-[var(--border-color)] p-4 flex flex-col gap-2 shadow-sm print:hidden">
          <button
            onClick={() => setActiveMainTab('dashboard')}
            className={`w-full text-start px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
              activeMainTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>{t.dashboardTab}</span>
            <span>🏠</span>
          </button>
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
                    {dashboardData.map((item) => (
                      <div key={item.partyId} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                          <span className="text-xs font-bold truncate">{item.partyName}</span>
                        </div>
                        <div className="text-xs font-extrabold text-blue-600">
                          {item.votes.toLocaleString()} ({item.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;