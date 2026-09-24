import React, { useState, useEffect, useRef } from 'react';
import { 
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
  Download,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

// ناونیشانی باکئیند لەسەر Render
const API_URL = "https://dataelec.onrender.com";

type ThemeType = 'government' | 'dark' | 'light' | 'bee' | 'ocean' | 'sunset';
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

interface PartyItem {
  partyId: number;
  partyName: string;
  color: string;
  hexColor: string;
}

interface BranchVoteMetaData {
  validVotes: number;
  invalidVotes: number;
  totalVoters: number;
}

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
    beeTheme: '🐝 هەنگوین',
    oceanTheme: '🌊 ئۆقیانوسی',
    sunsetTheme: '🌇 ڕۆژئاوا',
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
    beeTheme: '🐝 هەنگوین',
    oceanTheme: '🌊 ئۆقیانوسی',
    sunsetTheme: '🌇 ڕۆژاڤا',
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
    beeTheme: '🐝 Bee',
    oceanTheme: '🌊 Ocean',
    sunsetTheme: '🌇 Sunset',
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
    beeTheme: '🐝 عسلي',
    oceanTheme: '🌊 محيطي',
    sunsetTheme: '🌇 غروب',
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
    beeTheme: '🐝 زنبوری',
    oceanTheme: '🌊 اقیانوسی',
    sunsetTheme: '🌇 غروب',
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

  // بەکارهێنەران تەنها لە داتابەیسی ڕێندەرەوە دێن — هیچ بەکارهێنەرێکی هاردکۆدکراو نییە
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [serverUnreachable, setServerUnreachable] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const initialParties: PartyItem[] = [
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

  const [defaultParties, setDefaultParties] = useState<PartyItem[]>(initialParties);

  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyColor, setNewPartyColor] = useState('#3b82f6');

  // وەرگرتنی خولەکان یان دەنگەکان لە باکئیند لەسەر Render لەگەڵ کۆنترۆڵی تاقیکاری Console
  useEffect(() => {
    console.log("Fetching data from backend...");
    fetch(`${API_URL}/api/rounds`)
      .then(res => res.json())
      .then(data => {
        console.log("Data received:", data);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  // فەنکشنی پاشەکەوتکردنی دەنگەکان لە باکئیند
  const saveVotesToBackend = async (regionId: number, votesList: any[]) => {
    try {
      const response = await fetch(`${API_URL}/api/region-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regionId,
          votes: votesList
        }),
      });

      if (!response.ok) {
        throw new Error('کێشە هەیە لە ناردنی دەنگەکان بۆ باکئیند');
      }

      const data = await response.json();
      console.log('دەنگەکان بە سەرکەوتوویی پاشەکەوت کران:', data);
    } catch (error) {
      console.error('هەڵە لە پەیوەندیکردن بە Render:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const latestMe = users.find(user => user.id === currentUser.id);
    if (latestMe) setCurrentUser(latestMe);
  }, [users, currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!isStateLoaded) {
      setLoginError(lang === 'ckb'
        ? 'پەیوەندی بە سێرڤەری داتا (Render) سەرکەوتوو نەبووە! بەکارهێنەران تەنها لە داتابەیسی ڕێندەرەوە دێن.'
        : 'Unable to connect to the data server (Render)! Users come only from the Render database.');
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
    const foundUser = users.find(u => u.username.trim().toLowerCase() === normalizedUsername && u.password === password);

    if (foundUser) {
      setCurrentUser(foundUser);
      setIsLoggedIn(true);
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
    const targetEmail = "bahman4kurd@gmail.com";

    if (recoveryEmail.trim().toLowerCase() === targetEmail) {
      setRecoveryMessage('پاسۆردی نوێ بە سەرکەوتوویی نێردرا بۆ ئیمەیڵەکەت: ' + targetEmail);
      setLoginError('');
    } else {
      setLoginError('ئەم ئیمەیڵە ناسراو نییە! تکایە (bahman4kurd@gmail.com) بنووسە.');
      setRecoveryMessage('');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setAuthView('login');
  };

  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'rounds' | 'controlPanel' | 'reports'>('dashboard');
  
  useEffect(() => {
    if (currentUser?.role === 'viewer' && activeMainTab === 'reports') {
      setActiveMainTab('dashboard');
    }
  }, [currentUser, activeMainTab]);

  const [theme, setTheme] = useState<ThemeType>('government');

  const [rounds, setRounds] = useState<ElectionRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundType, setRoundType] = useState('پەرلەمانی');
  const [roundVoters, setRoundVoters] = useState('');
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);
  const [copyBranchesFromRoundId, setCopyBranchesFromRoundId] = useState('');
  const [copyIntoSourceId, setCopyIntoSourceId] = useState('');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [newRegionName, setNewRegionName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [editingRegionId, setEditingRegionId] = useState<number | null>(null);

  const [regionVotes, setRegionVotes] = useState<{ [regionId: number]: PartyVote[] }>({});

  const [branchVotes, setBranchVotes] = useState<{ [branchId: number]: PartyVote[] }>({});

  const [branchMeta, setBranchMeta] = useState<{ [branchId: number]: BranchVoteMetaData }>({});

  const [regionMeta, setRegionMeta] = useState<{ [regionId: number]: BranchVoteMetaData }>({});

  const [dashboardChartType, setDashboardChartType] = useState<ChartType>('donut');
  
  const [dashSelectedBranchIds, setDashSelectedBranchIds] = useState<number[]>([]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const [dashSelectedRegionIds, setDashSelectedRegionIds] = useState<number[]>([]);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const [dashSelectedRoundId, setDashSelectedRoundId] = useState<number | null>(null);

  const [repSelectedRoundId, setRepSelectedRoundId] = useState<number | null>(null);
  const [repSelectedBranchIds, setRepSelectedBranchIds] = useState<number[]>([]);
  const [repSelectedRegionIds, setRepSelectedRegionIds] = useState<number[]>([]);
  const [isRepBranchOpen, setIsRepBranchOpen] = useState(false);
  const [isRepRegionOpen, setIsRepRegionOpen] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const [selectedPartyIds, setSelectedPartyIds] = useState<number[]>(() => defaultParties.map(p => p.partyId));
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedPartyIds(prev => {
      const allIds = defaultParties.map(p => p.partyId);
      const newIds = allIds.filter(id => !prev.includes(id));
      const validPrev = prev.filter(id => allIds.includes(id));
      return [...validPrev, ...newIds];
    });
  }, [defaultParties]);

  const handleAddNewParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim() || currentUser?.role === 'viewer') return;

    const newParty: PartyItem = {
      partyId: Date.now(),
      partyName: newPartyName.trim(),
      color: 'bg-blue-600',
      hexColor: newPartyColor
    };

    setDefaultParties(prev => [...prev, newParty]);
    setSelectedPartyIds(prev => [...prev, newParty.partyId]);
    setNewPartyName('');
  };

  const handleDeleteParty = (partyIdToDelete: number) => {
    if (currentUser?.role === 'viewer') return;
    if (!window.confirm('ئایا دڵنیایت لە سڕینەوەی ئەم لایەنە لە لیستی بەشداربووان؟')) return;

    setDefaultParties(prev => prev.filter(p => p.partyId !== partyIdToDelete));
    setSelectedPartyIds(prev => prev.filter(id => id !== partyIdToDelete));

    setBranchVotes(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(bId => {
        const numericId = Number(bId);
        updated[numericId] = updated[numericId].filter(pv => pv.partyId !== partyIdToDelete);
      });
      return updated;
    });

    setRegionVotes(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(rId => {
        const numericId = Number(rId);
        updated[numericId] = updated[numericId].filter(pv => pv.partyId !== partyIdToDelete);
      });
      return updated;
    });
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await fetch(`${API_URL}/api/state`);
        if (!response.ok) throw new Error('Unable to load shared state.');
        const data = await response.json();
        if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
        if (Array.isArray(data.defaultParties)) setDefaultParties(data.defaultParties);
        if (Array.isArray(data.rounds)) setRounds(data.rounds);
        if (Array.isArray(data.branches)) setBranches(data.branches);
        if (Array.isArray(data.regions)) setRegions(data.regions);
        if (data.regionVotes) setRegionVotes(data.regionVotes);
        if (data.branchVotes) setBranchVotes(data.branchVotes);
        if (data.branchMeta) setBranchMeta(data.branchMeta);
        if (data.regionMeta) setRegionMeta(data.regionMeta);
        if (typeof data.selectedRoundId === 'number') setSelectedRoundId(data.selectedRoundId);
        if (typeof data.selectedBranchId === 'number') setSelectedBranchId(data.selectedBranchId);
        if (typeof data.selectedRegionId === 'number') setSelectedRegionId(data.selectedRegionId);
        if (typeof data.dashSelectedRoundId === 'number') setDashSelectedRoundId(data.dashSelectedRoundId);
        setIsStateLoaded(true);
      } catch (error) {
        console.error('Unable to load data from Render:', error);
        setServerUnreachable(true);
      }
    };
    void loadState();
  }, []);

  useEffect(() => {
    if (!isStateLoaded) return;
    const timeoutId = window.setTimeout(() => {
      void fetch(`${API_URL}/api/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users,
          defaultParties,
          rounds,
          branches,
          regions,
          regionVotes,
          branchVotes,
          branchMeta,
          regionMeta,
          selectedRoundId,
          selectedBranchId,
          selectedRegionId,
          dashSelectedRoundId,
        }),
      }).catch(error => console.error('Unable to save data to Render:', error));
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [
    isStateLoaded,
    users,
    defaultParties,
    rounds,
    branches,
    regions,
    regionVotes,
    branchVotes,
    branchMeta,
    regionMeta,
    selectedRoundId,
    selectedBranchId,
    selectedRegionId,
    dashSelectedRoundId,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'branch_admin' || currentUser.role === 'viewer') && currentUser.branchId) {
      setSelectedBranchId(currentUser.branchId);
      const targetBranch = branches.find(b => b.id === currentUser.branchId);
      if (targetBranch) {
        setDashSelectedBranchIds([targetBranch.id]);
        setDashSelectedRoundId(targetBranch.roundId);
        setSelectedRoundId(targetBranch.roundId);
        setRepSelectedRoundId(targetBranch.roundId);
        setRepSelectedBranchIds([targetBranch.id]);
      }
    }
  }, [currentUser, branches]);

  useEffect(() => {
    if (rounds.length > 0 && (!dashSelectedRoundId || !rounds.some(r => r.id === dashSelectedRoundId))) {
      const firstId = rounds[0].id;
      setDashSelectedRoundId(firstId);
      setRepSelectedRoundId(firstId);
      const rBranches = branches.filter(b => b.roundId === firstId).map(b => b.id);
      if (currentUser?.role === 'super_admin') {
        setDashSelectedBranchIds(rBranches);
        setRepSelectedBranchIds(rBranches);
      }
    }
    if (rounds.length > 0 && (!selectedRoundId || !rounds.some(r => r.id === selectedRoundId))) {
      setSelectedRoundId(rounds[0].id);
    }
  }, [rounds]);

  useEffect(() => {
    if (dashSelectedRoundId) {
      const roundBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId 
        ? branches.filter(b => b.roundId === dashSelectedRoundId && b.id === currentUser.branchId)
        : branches.filter(b => b.roundId === dashSelectedRoundId);
      
      setDashSelectedBranchIds(roundBranches.map(b => b.id));
      setDashSelectedRegionIds([]);
    }
  }, [dashSelectedRoundId, branches]);

  useEffect(() => {
    if (repSelectedRoundId) {
      const roundBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId 
        ? branches.filter(b => b.roundId === repSelectedRoundId && b.id === currentUser.branchId)
        : branches.filter(b => b.roundId === repSelectedRoundId);
      
      setRepSelectedBranchIds(roundBranches.map(b => b.id));
      setRepSelectedRegionIds([]);
    } else if (rounds.length > 0) {
      setRepSelectedRoundId(rounds[0].id);
    }
  }, [repSelectedRoundId, branches]);

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
      setRepSelectedRoundId(newRound.id);

      if (copyBranchesFromRoundId) {
        const srcBranches = branches.filter(b => b.roundId === Number(copyBranchesFromRoundId));
        const stamp = Date.now();
        const branchIdMap = new Map<number, number>();
        const clonedBranches: Branch[] = srcBranches.map((b, i) => {
          const newId = stamp + i + 1;
          branchIdMap.set(b.id, newId);
          return { id: newId, roundId: newRound.id, name: b.name };
        });
        const clonedRegions: Region[] = regions
          .filter(rg => branchIdMap.has(rg.branchId))
          .map((rg, i) => ({ id: stamp + 100000 + i + 1, branchId: branchIdMap.get(rg.branchId)!, name: rg.name }));
        if (clonedBranches.length > 0) setBranches([...branches, ...clonedBranches]);
        if (clonedRegions.length > 0) setRegions([...regions, ...clonedRegions]);
        setCopyBranchesFromRoundId('');
      }
    }
    setRoundName('');
    setRoundDate('');
    setRoundVoters('');
  };

  const handleCopyBranchesIntoRounds = (targetAll: boolean) => {
    if (currentUser?.role !== 'super_admin' || !copyIntoSourceId || !selectedRoundId) return;
    const srcId = Number(copyIntoSourceId);
    const targets = targetAll ? rounds.filter(r => r.id !== srcId).map(r => r.id) : [selectedRoundId];
    const addedBranches: Branch[] = [];
    const addedRegions: Region[] = [];
    let stamp = Date.now();
    targets.forEach(tid => {
      const nameToBranchId = new Map<string, number>();
      branches.filter(b => b.roundId === tid).forEach(b => nameToBranchId.set(b.name, b.id));
      addedBranches.filter(b => b.roundId === tid).forEach(b => nameToBranchId.set(b.name, b.id));
      branches.filter(b => b.roundId === srcId).forEach(sb => {
        let tBranchId = nameToBranchId.get(sb.name);
        if (tBranchId === undefined) {
          tBranchId = ++stamp;
          addedBranches.push({ id: tBranchId, roundId: tid, name: sb.name });
          nameToBranchId.set(sb.name, tBranchId);
        }
        const existingRegionNames = new Set<string>();
        regions.forEach(rg => { if (rg.branchId === tBranchId) existingRegionNames.add(rg.name); });
        addedRegions.forEach(rg => { if (rg.branchId === tBranchId) existingRegionNames.add(rg.name); });
        regions.filter(rg => rg.branchId === sb.id).forEach(sr => {
          if (!existingRegionNames.has(sr.name)) {
            addedRegions.push({ id: ++stamp, branchId: tBranchId, name: sr.name });
            existingRegionNames.add(sr.name);
          }
        });
      });
    });
    if (addedBranches.length > 0) setBranches(prev => [...prev, ...addedBranches]);
    if (addedRegions.length > 0) setRegions(prev => [...prev, ...addedRegions]);
    setCopyIntoSourceId('');
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
    if (repSelectedRoundId === id) setRepSelectedRoundId(null);
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
      setBranchMeta(prev => ({
        ...prev,
        [newB.id]: { validVotes: 0, invalidVotes: 0, totalVoters: 0 }
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
      setRegionMeta(prev => ({
        ...prev,
        [newReg.id]: { validVotes: 0, invalidVotes: 0, totalVoters: 0 }
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
    const currentList = getMergedRegionVotes(regionId);
    const currentMeta = regionMeta[regionId] || { validVotes: 0, invalidVotes: 0, totalVoters: 0 };
    
    const updated = currentList.map(item => {
      const v = item.partyId === partyId ? votes : item.votes;
      return { ...item, votes: v };
    });

    const sumVotes = updated.reduce((acc, curr) => acc + curr.votes, 0);
    const validBase = currentMeta.validVotes > 0 ? currentMeta.validVotes : sumVotes;

    const recalculated = updated.map(item => ({
      ...item,
      percentage: validBase > 0 ? Number(((item.votes / validBase) * 100).toFixed(1)) : 0
    }));

    setRegionVotes({
      ...regionVotes,
      [regionId]: recalculated
    });

    saveVotesToBackend(regionId, recalculated);
  };

  const handleBranchVoteChange = (branchId: number, partyId: number, votes: number) => {
    if (currentUser?.role === 'viewer') return;
    const currentList = getMergedBranchVotes(branchId);
    const currentMeta = branchMeta[branchId] || { validVotes: 0, invalidVotes: 0, totalVoters: 0 };
    
    const updated = currentList.map(item => {
      const v = item.partyId === partyId ? votes : item.votes;
      return { ...item, votes: v };
    });

    const sumVotes = updated.reduce((acc, curr) => acc + curr.votes, 0);
    const validBase = currentMeta.validVotes > 0 ? currentMeta.validVotes : sumVotes;

    const recalculated = updated.map(item => ({
      ...item,
      percentage: validBase > 0 ? Number(((item.votes / validBase) * 100).toFixed(1)) : 0
    }));

    setBranchVotes({
      ...branchVotes,
      [branchId]: recalculated
    });
  };

  const handleBranchMetaChange = (branchId: number, key: keyof BranchVoteMetaData, val: number) => {
    if (currentUser?.role === 'viewer') return;
    const currentMeta = branchMeta[branchId] || { validVotes: 0, invalidVotes: 0, totalVoters: 0 };
    const updatedMeta = { ...currentMeta, [key]: val };
    
    setBranchMeta(prev => ({
      ...prev,
      [branchId]: updatedMeta
    }));

    const currentList = getMergedBranchVotes(branchId);
    const sumVotes = currentList.reduce((acc, curr) => acc + curr.votes, 0);
    const validBase = updatedMeta.validVotes > 0 ? updatedMeta.validVotes : sumVotes;

    const recalculated = currentList.map(item => ({
      ...item,
      percentage: validBase > 0 ? Number(((item.votes / validBase) * 100).toFixed(1)) : 0
    }));

    setBranchVotes(prev => ({
      ...prev,
      [branchId]: recalculated
    }));
  };

  const handleRegionMetaChange = (regionId: number, key: keyof BranchVoteMetaData, val: number) => {
    if (currentUser?.role === 'viewer') return;
    const currentMeta = regionMeta[regionId] || { validVotes: 0, invalidVotes: 0, totalVoters: 0 };
    const updatedMeta = { ...currentMeta, [key]: val };

    setRegionMeta(prev => ({
      ...prev,
      [regionId]: updatedMeta
    }));

    const currentList = getMergedRegionVotes(regionId);
    const sumVotes = currentList.reduce((acc, curr) => acc + curr.votes, 0);
    const validBase = updatedMeta.validVotes > 0 ? updatedMeta.validVotes : sumVotes;

    const recalculated = currentList.map(item => ({
      ...item,
      percentage: validBase > 0 ? Number(((item.votes / validBase) * 100).toFixed(1)) : 0
    }));

    setRegionVotes(prev => ({
      ...prev,
      [regionId]: recalculated
    }));
  };

  const getMergedBranchVotes = (branchId: number): PartyVote[] => {
    const existing = branchVotes[branchId] || [];
    return defaultParties.map(party => {
      const found = existing.find(e => e.partyId === party.partyId);
      return {
        partyId: party.partyId,
        partyName: party.partyName,
        votes: found ? found.votes : 0,
        percentage: found ? found.percentage : 0,
        color: party.color,
        hexColor: party.hexColor
      };
    });
  };

  const getMergedRegionVotes = (regionId: number): PartyVote[] => {
    const existing = regionVotes[regionId] || [];
    return defaultParties.map(party => {
      const found = existing.find(e => e.partyId === party.partyId);
      return {
        partyId: party.partyId,
        partyName: party.partyName,
        votes: found ? found.votes : 0,
        percentage: found ? found.percentage : 0,
        color: party.color,
        hexColor: party.hexColor
      };
    });
  };

  const getFilteredDashboardVotes = () => {
    if (!dashSelectedRoundId) return [];

    const aggregated: { [partyId: number]: { partyName: string; votes: number; hexColor: string; color: string } } = {};

    defaultParties.forEach(p => {
      aggregated[p.partyId] = { partyName: p.partyName, votes: 0, hexColor: p.hexColor, color: p.color };
    });

    const targetBranchIds = dashSelectedBranchIds.length > 0 
      ? dashSelectedBranchIds 
      : branches.filter(b => b.roundId === dashSelectedRoundId).map(b => b.id);

    targetBranchIds.forEach(bId => {
      const relevantRegions = regions.filter(reg => reg.branchId === bId && (dashSelectedRegionIds.length === 0 || dashSelectedRegionIds.includes(reg.id)));
      
      if (relevantRegions.length > 0) {
        relevantRegions.forEach(reg => {
          const vList = getMergedRegionVotes(reg.id);
          vList.forEach(item => {
            if (aggregated[item.partyId]) {
              aggregated[item.partyId].votes += (item.votes || 0);
            }
          });
        });
      } else {
        const bList = getMergedBranchVotes(bId);
        bList.forEach(item => {
          if (aggregated[item.partyId]) {
            aggregated[item.partyId].votes += (item.votes || 0);
          }
        });
      }
    });

    const totalValidVotesSum = Object.values(aggregated).reduce((s, item) => s + item.votes, 0);

    let results = Object.keys(aggregated).map(idStr => {
      const pId = Number(idStr);
      const item = aggregated[pId];
      return {
        partyId: pId,
        partyName: item.partyName,
        votes: item.votes,
        hexColor: item.hexColor,
        color: item.color,
        percentage: totalValidVotesSum > 0 ? Number(((item.votes / totalValidVotesSum) * 100).toFixed(1)) : 0
      };
    });

    results = results.filter(item => selectedPartyIds.includes(item.partyId));

    return results;
  };

  const getFilteredReportVotes = () => {
    if (!repSelectedRoundId) return [];

    const aggregated: { [partyId: number]: { partyName: string; votes: number; hexColor: string; color: string } } = {};

    defaultParties.forEach(p => {
      aggregated[p.partyId] = { partyName: p.partyName, votes: 0, hexColor: p.hexColor, color: p.color };
    });

    const targetBranchIds = repSelectedBranchIds.length > 0 
      ? repSelectedBranchIds 
      : branches.filter(b => b.roundId === repSelectedRoundId).map(b => b.id);

    targetBranchIds.forEach(bId => {
      const relevantRegions = regions.filter(reg => reg.branchId === bId && (repSelectedRegionIds.length === 0 || repSelectedRegionIds.includes(reg.id)));
      
      if (relevantRegions.length > 0) {
        relevantRegions.forEach(reg => {
          const vList = getMergedRegionVotes(reg.id);
          vList.forEach(item => {
            if (aggregated[item.partyId]) {
              aggregated[item.partyId].votes += (item.votes || 0);
            }
          });
        });
      } else {
        const bList = getMergedBranchVotes(bId);
        bList.forEach(item => {
          if (aggregated[item.partyId]) {
            aggregated[item.partyId].votes += (item.votes || 0);
          }
        });
      }
    });

    const totalValidVotesSum = Object.values(aggregated).reduce((s, item) => s + item.votes, 0);

    let results = Object.keys(aggregated).map(idStr => {
      const pId = Number(idStr);
      const item = aggregated[pId];
      return {
        partyId: pId,
        partyName: item.partyName,
        votes: item.votes,
        hexColor: item.hexColor,
        color: item.color,
        percentage: totalValidVotesSum > 0 ? Number(((item.votes / totalValidVotesSum) * 100).toFixed(1)) : 0
      };
    });

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

  const currentRound = rounds.find(r => r.id === selectedRoundId);
  const currentBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId
    ? branches.filter(b => b.roundId === selectedRoundId && b.id === currentUser.branchId)
    : branches.filter(b => b.roundId === selectedRoundId);

  const currentRegions = regions.filter(reg => reg.branchId === selectedBranchId);
  const currentRegionVotes = selectedRegionId ? getMergedRegionVotes(selectedRegionId) : [];
  const currentBranchVotes = selectedBranchId ? getMergedBranchVotes(selectedBranchId) : [];

  const dashFilteredBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId
    ? branches.filter(b => b.roundId === dashSelectedRoundId && b.id === currentUser.branchId)
    : dashSelectedRoundId ? branches.filter(b => b.roundId === dashSelectedRoundId) : [];

  const dashFilteredRegions = regions.filter(reg => dashSelectedBranchIds.includes(reg.branchId));

  const repFilteredBranches = (currentUser?.role === 'branch_admin' || currentUser?.role === 'viewer') && currentUser.branchId
    ? branches.filter(b => b.roundId === repSelectedRoundId && b.id === currentUser.branchId)
    : repSelectedRoundId ? branches.filter(b => b.roundId === repSelectedRoundId) : [];

  const repFilteredRegions = regions.filter(reg => repSelectedBranchIds.includes(reg.branchId));

  const dashboardData = getFilteredDashboardVotes();
  const totalDashboardVotes = dashboardData.reduce((acc, curr) => acc + curr.votes, 0);
  const dashSelectedRoundObj = rounds.find(r => r.id === dashSelectedRoundId);

  const reportData = getFilteredReportVotes();
  const totalReportVotes = reportData.reduce((acc, curr) => acc + curr.votes, 0);
  const repSelectedRoundObj = rounds.find(r => r.id === repSelectedRoundId);

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = reportRef.current;

    if (element) {
        // html2pdf زۆر قورسە (html2canvas + jsPDF) بۆیە تەنها کاتێک دادەبەزێت کە بەکارهێنەر دەیخوازێت
        const { default: html2pdf } = await import('html2pdf.js');
        const options = {
            margin:       10,
            filename:     'election-report.pdf',
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        html2pdf().from(element).set(options).save();
    }
  };

  const getDir = () => (lang === 'en' ? 'ltr' : 'rtl');

  const navClass = (isActive: boolean, activeColor = 'bg-blue-600') =>
    `shrink-0 md:w-full text-start px-2.5 py-2 md:px-4 md:py-3 rounded-lg text-[10px] sm:text-[11px] md:text-sm font-semibold transition-all flex items-center justify-center md:justify-between gap-1 max-md:flex-col-reverse max-md:min-w-[4.4rem] max-md:max-w-[7.25rem] ${
      isActive ? `${activeColor} text-white shadow-md` : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
    }`;

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] p-4" dir={getDir()}>
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl rounded-2xl p-5 sm:p-8 w-full max-w-md relative">
          
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
                <img src="/kdp-logo.jpg" alt="KDP" className="w-28 h-28 object-contain mx-auto mb-3 rounded-full shadow-lg ring-4 ring-blue-600/30" />
                <h2 className="text-2xl font-bold">{t.loginTitle}</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{t.loginSubtitle}</p>
              </div>

              {serverUnreachable && (
                <div className="mb-4 p-3 bg-amber-950/50 border border-amber-700 text-amber-300 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lang === 'ckb'
                    ? 'پەیوەندی بە سێرڤەری ڕێندەر سەرکەوتوو نەبووە — هیچ داتایەکی لۆکاڵ بەکارنەهاتووە، تکایە دواتر هەوڵ بدەوە.'
                    : 'Cannot reach the Render server — no local data is used, please try again later.'}</span>
                </div>
              )}

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
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.password}</label>
                  <div className="relative">
                    <Lock className={`absolute ${lang === 'en' ? 'left-3' : 'right-3'} top-3 w-5 h-5 text-gray-400`} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl ${lang === 'en' ? 'pl-10 pr-10' : 'pr-10 pl-10'} py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'شاردنەوەی وشەی نهێنی' : 'بینینی وشەی نهێنی'}
                      className={`absolute ${lang === 'en' ? 'right-3' : 'left-3'} top-3 text-gray-400 hover:text-gray-200 transition focus:outline-none`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
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
                      placeholder="bahman4kurd@gmail.com"
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
    <div className="h-dvh min-h-dvh max-w-full overflow-hidden flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200 print:h-auto print:overflow-visible" dir={getDir()}>
      <header className="shrink-0 z-30 min-h-14 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-3 md:px-6 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 shadow-md print:hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            📊
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold truncate">{t.systemTitle}</h1>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {t.userLabel} <span className="font-bold text-blue-500">{currentUser.name}</span> ({currentUser.role === 'super_admin' ? t.superAdmin : currentUser.role === 'branch_admin' ? t.branchAdmin : t.viewer})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border-color)] px-2 sm:px-3 py-1.5 rounded-lg shadow-sm">
            <Globe className="w-4 h-4 text-blue-500 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageType)}
              className="bg-transparent text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer max-w-[9.5rem] sm:max-w-none"
            >
              <option value="ckb">کوردی (سۆرانی)</option>
              <option value="kmr">کوردی (کرمانجی)</option>
              <option value="en">English</option>
              <option value="ar">عربي</option>
              <option value="fa">فارسی</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)] font-medium hidden md:inline">{t.themeLabel}</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium focus:outline-none max-w-[10.5rem] sm:max-w-none"
            >
              <option value="government">{t.governmentTheme}</option>
              <option value="dark">{t.darkTheme}</option>
              <option value="light">{t.lightTheme}</option>
              <option value="bee">{t.beeTheme}</option>
              <option value="ocean">{t.oceanTheme}</option>
              <option value="sunset">{t.sunsetTheme}</option>
            </select>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-semibold transition border border-red-800/40"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <aside className="order-2 md:order-1 w-full md:w-64 shrink-0 bg-[var(--bg-card)] border-t md:border-t-0 md:border-e border-[var(--border-color)] p-2 md:p-4 flex flex-row md:flex-col gap-1.5 md:gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:shadow-sm print:hidden overflow-x-auto md:overflow-x-visible pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <span className="hidden md:block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-1">
            {t.mainSections}
          </span>

          <button
            onClick={() => setActiveMainTab('dashboard')}
            className={navClass(activeMainTab === 'dashboard')}
          >
            <span className="max-md:line-clamp-2 max-md:text-center">{t.dashboardTab}</span>
            <span>🏠</span>
          </button>

          <button
            onClick={() => setActiveMainTab('rounds')}
            className={navClass(activeMainTab === 'rounds')}
          >
            <span className="max-md:line-clamp-2 max-md:text-center">{t.roundsTab}</span>
            <span>🗳️</span>
          </button>

          {currentUser.role === 'super_admin' && (
            <button
              onClick={() => setActiveMainTab('controlPanel')}
              className={navClass(activeMainTab === 'controlPanel', 'bg-amber-600')}
            >
              <span className="max-md:line-clamp-2 max-md:text-center">{t.controlPanelTab}</span>
              <span>⚙️</span>
            </button>
          )}

          {currentUser.role !== 'viewer' && (
            <button
              onClick={() => setActiveMainTab('reports')}
              className={navClass(activeMainTab === 'reports', 'bg-emerald-600')}
            >
              <span className="max-md:line-clamp-2 max-md:text-center">{t.reportsTab}</span>
              <span>📑</span>
            </button>
          )}

          {currentUser.role === 'branch_admin' && (
            <button
              onClick={() => setActiveMainTab('controlPanel')}
              className={navClass(activeMainTab === 'controlPanel')}
            >
              <span className="max-md:line-clamp-2 max-md:text-center">{t.myPasswordTab}</span>
              <span>🔑</span>
            </button>
          )}
        </aside>

        <main className="order-1 md:order-2 flex-1 min-h-0 min-w-0 p-3 md:p-6 overflow-y-auto overflow-x-hidden space-y-6">
          {activeMainTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-[var(--border-color)] pb-4">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold">{t.dashboardHeading}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 break-words">
                      {dashSelectedRoundObj ? `${t.selectedRound} ${dashSelectedRoundObj.name} (${dashSelectedRoundObj.date})` : t.noRoundSelected}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <label className="text-sm font-medium text-[var(--text-secondary)] shrink-0">{t.chartTypeLabel}</label>
                    <select
                      value={dashboardChartType}
                      onChange={(e) => setDashboardChartType(e.target.value as ChartType)}
                      className="w-full md:w-auto bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                    >
                      <option value="bars">📊 هێڵکاری ستوونی</option>
                      <option value="pie">🥧 هێڵکاری بازنەیی</option>
                      <option value="donut">🍩 هێڵکاری دۆنات</option>
                      <option value="progress">📈 ڕێژەی سەدی</option>
                      <option value="line">📉 هێڵکاری گەشەسەندن</option>
                      <option value="network">🕸️ هێڵکاری تۆڕی پێشکەوتوو</option>
                      <option value="radial">🎯 هێڵکاری پەیڤەری و تیشکی</option>
                    </select>
                  </div>
                </div>

                {rounds.length === 0 ? (
                  <div className="p-8 text-center bg-amber-950/20 border border-amber-800/40 rounded-xl">
                    <p className="text-amber-400 font-medium">{t.noRoundsWarning}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 bg-[var(--bg-main)] p-3 sm:p-4 rounded-xl border border-[var(--border-color)]">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">خولی هەڵبژاردن</label>
                        <select
                          value={dashSelectedRoundId || ''}
                          onChange={(e) => setDashSelectedRoundId(Number(e.target.value))}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                        >
                          {rounds.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.filterBranchLabel}</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold text-start flex justify-between items-center"
                          >
                            <span className="truncate">
                              {dashSelectedBranchIds.length === 0 ? t.allBranchesOption : `${dashSelectedBranchIds.length} لق دیاریکراوە`}
                            </span>
                            <span>▼</span>
                          </button>
                          {isBranchDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg p-2 space-y-1">
                              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)] text-xs">
                                <button 
                                  onClick={() => setDashSelectedBranchIds(dashFilteredBranches.map(b => b.id))}
                                  className="text-blue-500 hover:underline"
                                >
                                  هەمووی هەڵبژێرە
                                </button>
                                <button 
                                  onClick={() => setDashSelectedBranchIds([])}
                                  className="text-red-400 hover:underline"
                                >
                                  پاککردنەوە
                                </button>
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {dashFilteredBranches.map(b => (
                                  <label key={b.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-[var(--bg-hover)] rounded">
                                    <input
                                      type="checkbox"
                                      checked={dashSelectedBranchIds.includes(b.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setDashSelectedBranchIds([...dashSelectedBranchIds, b.id]);
                                        } else {
                                          setDashSelectedBranchIds(dashSelectedBranchIds.filter(id => id !== b.id));
                                        }
                                      }}
                                      className="rounded bg-[var(--bg-main)] text-blue-600"
                                    />
                                    <span>{b.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.filterAreaLabel}</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold text-start flex justify-between items-center"
                          >
                            <span className="truncate">
                              {dashSelectedRegionIds.length === 0 ? t.allAreasOption : `${dashSelectedRegionIds.length} ناوچە دیاریکراوە`}
                            </span>
                            <span>▼</span>
                          </button>
                          {isRegionDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg p-2 space-y-1">
                              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)] text-xs">
                                <button 
                                  onClick={() => setDashSelectedRegionIds(dashFilteredRegions.map(r => r.id))}
                                  className="text-blue-500 hover:underline"
                                >
                                  هەمووی هەڵبژێرە
                                </button>
                                <button 
                                  onClick={() => setDashSelectedRegionIds([])}
                                  className="text-red-400 hover:underline"
                                >
                                  پاککردنەوە
                                </button>
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {dashFilteredRegions.map(reg => (
                                  <label key={reg.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-[var(--bg-hover)] rounded">
                                    <input
                                      type="checkbox"
                                      checked={dashSelectedRegionIds.includes(reg.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setDashSelectedRegionIds([...dashSelectedRegionIds, reg.id]);
                                        } else {
                                          setDashSelectedRegionIds(dashSelectedRegionIds.filter(id => id !== reg.id));
                                        }
                                      }}
                                      className="rounded bg-[var(--bg-main)] text-blue-600"
                                    />
                                    <span>{reg.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.filterPartyLabel}</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsPartyDropdownOpen(!isPartyDropdownOpen)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold text-start flex justify-between items-center"
                          >
                            <span className="truncate">
                              {selectedPartyIds.length === defaultParties.length ? t.selectAllParties : `${selectedPartyIds.length} لایەن دیاریکراوە`}
                            </span>
                            <span>▼</span>
                          </button>
                          {isPartyDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg p-2 space-y-1">
                              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)] text-xs">
                                <button 
                                  onClick={() => setSelectedPartyIds(defaultParties.map(p => p.partyId))}
                                  className="text-blue-500 hover:underline"
                                >
                                  هەمووی هەڵبژێرە
                                </button>
                                <button 
                                  onClick={() => setSelectedPartyIds([])}
                                  className="text-red-400 hover:underline"
                                >
                                  پاککردنەوە
                                </button>
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {defaultParties.map(party => (
                                  <label key={party.partyId} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-[var(--bg-hover)] rounded">
                                    <input
                                      type="checkbox"
                                      checked={selectedPartyIds.includes(party.partyId)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedPartyIds([...selectedPartyIds, party.partyId]);
                                        } else {
                                          setSelectedPartyIds(selectedPartyIds.filter(id => id !== party.partyId));
                                        }
                                      }}
                                      className="rounded bg-[var(--bg-main)] text-blue-600"
                                    />
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: party.hexColor }}></span>
                                    <span className="truncate">{party.partyName}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-600/10 border border-blue-600/30 px-3 sm:px-4 py-3 rounded-xl">
                      <span className="font-semibold text-sm">{t.totalVotesLabel}</span>
                      <span className="text-base sm:text-lg font-bold text-blue-500">{totalDashboardVotes.toLocaleString()} دەنگ</span>
                    </div>

                    {dashboardChartType === 'bars' && (
                      <div className="space-y-3 pt-4">
                        {dashboardData.map(item => (
                          <div key={item.partyId} className="space-y-1">
                            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs font-semibold">
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                                <span className="break-words">{item.partyName}</span>
                              </span>
                              <span className="shrink-0">{item.votes.toLocaleString()} دەنگ ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-[var(--bg-main)] h-3 rounded-full overflow-hidden border border-[var(--border-color)]">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ width: `${item.percentage}%`, backgroundColor: item.hexColor }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(dashboardChartType === 'pie' || dashboardChartType === 'donut') && (
                      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-10 py-4 sm:py-8">
                        <div className="relative w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-full">
                          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            {createSvgSlices(dashboardData, dashboardChartType === 'donut')}
                          </svg>
                          {dashboardChartType === 'donut' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                              <span className="text-xs text-[var(--text-secondary)]">کۆی گشتی</span>
                              <span className="text-sm font-bold">{totalDashboardVotes.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-2 border border-[var(--border-color)] rounded-xl bg-[var(--bg-main)]">
                          {dashboardData.map(item => (
                            <div key={item.partyId} className="flex items-center gap-2 text-xs p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                              <div className="truncate flex-1">
                                <p className="font-semibold truncate">{item.partyName}</p>
                                <p className="text-[var(--text-secondary)]">{item.votes.toLocaleString()} ({item.percentage}%)</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dashboardChartType === 'progress' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        {dashboardData.map(item => (
                          <div key={item.partyId} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-4 rounded-xl space-y-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                              <h4 className="font-bold text-sm truncate">{item.partyName}</h4>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-[var(--text-secondary)]">ژمارەی دەنگ</p>
                                <p className="text-lg font-bold">{item.votes.toLocaleString()}</p>
                              </div>
                              <span className="text-xl font-extrabold text-blue-500">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                              <div 
                                className="h-full rounded-full" 
                                style={{ width: `${item.percentage}%`, backgroundColor: item.hexColor }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {dashboardChartType === 'line' && (
                      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                        <h4 className="font-bold text-sm text-[var(--text-secondary)]">ڕەوتی هێڵی ڕێژەی دەنگەکان</h4>
                        <div className="flex items-end justify-around h-64 pt-6 border-b border-x border-[var(--border-color)] px-2 overflow-x-auto relative gap-2">
                          {dashboardData.map((item) => (
                            <div key={item.partyName} className="flex flex-col items-center gap-2 h-full justify-end group min-w-[60px]">
                              <span className="text-xs font-bold text-blue-500">{item.percentage}%</span>
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
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-bold">چالاک و ڕاستەقینە</span>
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
                                <span className="text-xl font-extrabold text-blue-500">{item.votes.toLocaleString()}</span>
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
                  </>
                )}
              </div>
            </div>
          )}

          {activeMainTab === 'rounds' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
                  <h2 className="text-lg sm:text-xl font-bold">{t.roundsTab}</h2>
                </div>

                {currentUser.role === 'super_admin' && (
                  <form onSubmit={handleSaveRound} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.roundNameHeader}</label>
                      <input
                        type="text"
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        placeholder="هەڵبژاردنی پەرلەمانی..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.roundDateHeader}</label>
                      <input
                        type="date"
                        value={roundDate}
                        onChange={(e) => setRoundDate(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.roundTypeHeader}</label>
                      <select
                        value={roundType}
                        onChange={(e) => setRoundType(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="پەرلەمانی">پەرلەمانی</option>
                        <option value="ئەنجومەنی پارێزگاکان">ئەنجومەنی پارێزگاکان</option>
                        <option value="سەرۆکایەتی">سەرۆکایەتی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.roundVotersHeader}</label>
                      <input
                        type="number"
                        value={roundVoters}
                        onChange={(e) => setRoundVoters(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        placeholder="100000"
                      />
                    </div>
                    {editingRoundId === null && rounds.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">کۆپی کردنی لق و ناوچەکان لە خولێکی پێوو</label>
                        <select
                          value={copyBranchesFromRoundId}
                          onChange={(e) => setCopyBranchesFromRoundId(e.target.value)}
                          className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        >
                          <option value="">بێ کۆپی (لقەکان دووبارە داغڵ بکەرەوە)</option>
                          {rounds.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.date})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                    >
                      {editingRoundId !== null ? t.updateBtn : '+ زیادکردنی خول'}
                    </button>
                  </form>
                )}

                <div className="overflow-x-auto -mx-1 px-1">
                  <table className="w-full min-w-[640px] text-start border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                        <th className="p-3 text-start">{t.roundNameHeader}</th>
                        <th className="p-3 text-start">{t.roundDateHeader}</th>
                        <th className="p-3 text-start">{t.roundTypeHeader}</th>
                        <th className="p-3 text-start">{t.roundVotersHeader}</th>
                        <th className="p-3 text-center">{t.actionsHeader}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-sm">
                      {rounds.map(r => (
                        <tr key={r.id} className="hover:bg-[var(--bg-hover)]">
                          <td className="p-3 font-semibold">{r.name}</td>
                          <td className="p-3 text-[var(--text-secondary)]">{r.date}</td>
                          <td className="p-3">{r.type}</td>
                          <td className="p-3">{r.totalVoters.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedRoundId(r.id); setActiveMainTab('dashboard'); }}
                              className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-xs font-semibold transition"
                            >
                              شیکاری
                            </button>
                            {currentUser.role === 'super_admin' && (
                              <>
                                <button
                                  onClick={() => handleEditRound(r)}
                                  className="bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white px-3 py-1 rounded text-xs font-semibold transition"
                                >
                                  {t.editBtn}
                                </button>
                                <button
                                  onClick={() => handleDeleteRound(r.id)}
                                  className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-semibold transition"
                                >
                                  {t.deleteBtn}
                                </button>
                              </>
                            )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {rounds.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-[var(--text-secondary)]">هیچ خولێکی هەڵبژاردن تۆمار نەکراوە.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRoundId && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                  <div className="border-b border-[var(--border-color)] pb-4 space-y-3">
                    <h3 className="text-base sm:text-lg font-bold break-words">بەڕێوەبردنی لقەکان و ناوچەکان بۆ خولی: {currentRound?.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] shrink-0">🗳️ خولی ئامانج (داتای دەنگدان بۆ ئەم خولە تۆمار دەکرێت):</label>
                      <select
                        value={selectedRoundId ?? ''}
                        onChange={(e) => { setSelectedRoundId(Number(e.target.value)); setSelectedBranchId(null); setSelectedRegionId(null); }}
                        className="w-full sm:w-auto bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                      >
                        {rounds.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.date})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {currentUser.role === 'super_admin' && (
                    <form onSubmit={handleSaveBranch} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-4 rounded-xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">ناوی لقی نوێ</label>
                        <input
                          type="text"
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                          placeholder="لقی هەولێر، سلێمانی..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition w-full sm:w-auto"
                      >
                        {editingBranchId !== null ? t.updateBtn : t.addBranchBtn}
                      </button>
                    </form>
                  )}

                  {currentUser.role === 'super_admin' && rounds.length > 1 && (
                    <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-4 rounded-xl space-y-3">
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">📋 کۆپی کردنی هەموو لق و ناوچەکان لە خولێکی ترەوە (تەنها ناو، بەبێ دەنگەکان — دووبارە هەڵبژاردن هیچ زیادی ناکات):</p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <select
                          value={copyIntoSourceId}
                          onChange={(e) => setCopyIntoSourceId(e.target.value)}
                          className="w-full sm:w-auto bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                        >
                          <option value="">هەڵبژاردنی خولی سەرچاوە...</option>
                          {rounds.filter(r => r.id !== selectedRoundId).map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.date})</option>
                          ))}
                        </select>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            disabled={!copyIntoSourceId}
                            onClick={() => handleCopyBranchesIntoRounds(false)}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
                          >
                            کۆپی بۆ ئەم خولە
                          </button>
                          <button
                            type="button"
                            disabled={!copyIntoSourceId}
                            onClick={() => handleCopyBranchesIntoRounds(true)}
                            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
                          >
                            کۆپی بۆ هەموو خولەکان
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2 lg:border-e border-[var(--border-color)] lg:pe-4">
                      <h4 className="text-sm font-bold text-[var(--text-secondary)]">لیستی لقەکان</h4>
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {currentBranches.map(b => (
                          <div 
                            key={b.id} 
                            onClick={() => setSelectedBranchId(b.id)}
                            className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition ${
                              selectedBranchId === b.id ? 'bg-blue-600 text-white font-bold' : 'bg-[var(--bg-main)] hover:bg-[var(--bg-hover)]'
                            }`}
                          >
                            <span>{b.name}</span>
                            {currentUser.role === 'super_admin' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteBranch(b.id); }}
                                className="text-red-400 hover:text-white p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      {selectedBranchId ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-500 font-bold border border-blue-600/30">🗳️ خول: {currentRound?.name} ({currentRound?.date})</span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/15 text-emerald-500 font-bold border border-emerald-600/30">📍 لق: {currentBranches.find(b => b.id === selectedBranchId)?.name}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-[var(--border-color)] pb-3">
                            <h4 className="font-bold text-sm">ناوچەکانی لقی هەڵبژاردراو</h4>
                            {currentUser.role !== 'viewer' && (
                              <form onSubmit={handleSaveRegion} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  value={newRegionName}
                                  onChange={(e) => setNewRegionName(e.target.value)}
                                  className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none w-full sm:w-auto"
                                  placeholder={t.newRegionPlaceholder}
                                  required
                                />
                                <button type="submit" className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                                  {t.addRegionBtn}
                                </button>
                              </form>
                            )}
                          </div>

                          {currentRegions.length === 0 ? (
                            <div className="space-y-4 bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
                              <p className="text-amber-400 text-xs font-medium">{t.noRegionsWarning}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">کۆی دەنگدەران</label>
                                  <input
                                    type="number"
                                    value={branchMeta[selectedBranchId]?.totalVoters || ''}
                                    onChange={(e) => handleBranchMetaChange(selectedBranchId, 'totalVoters', Number(e.target.value))}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                    disabled={currentUser?.role === 'viewer'}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">دەنگە دروستەکان</label>
                                  <input
                                    type="number"
                                    value={branchMeta[selectedBranchId]?.validVotes || ''}
                                    onChange={(e) => handleBranchMetaChange(selectedBranchId, 'validVotes', Number(e.target.value))}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                    disabled={currentUser?.role === 'viewer'}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">دەنگە نادروستەکان</label>
                                  <input
                                    type="number"
                                    value={branchMeta[selectedBranchId]?.invalidVotes || ''}
                                    onChange={(e) => handleBranchMetaChange(selectedBranchId, 'invalidVotes', Number(e.target.value))}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                    disabled={currentUser?.role === 'viewer'}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {currentBranchVotes.map(item => (
                                  <div key={item.partyId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                                      <span className="text-xs font-semibold break-words">{item.partyName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={item.votes || ''}
                                        onChange={(e) => handleBranchVoteChange(selectedBranchId, item.partyId, Number(e.target.value))}
                                        className="w-full sm:w-24 bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-center font-bold focus:outline-none"
                                        disabled={currentUser?.role === 'viewer'}
                                      />
                                      <span className="text-xs text-[var(--text-secondary)] w-12 text-end">{item.percentage}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {currentRegions.map(reg => (
                                  <button
                                    key={reg.id}
                                    onClick={() => setSelectedRegionId(reg.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                                      selectedRegionId === reg.id ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-main)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                                    }`}
                                  >
                                    <span>{reg.name}</span>
                                    {currentUser.role !== 'viewer' && (
                                      <span 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRegion(reg.id); }}
                                        className="text-red-400 hover:text-white"
                                      >
                                        ×
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>

                              {selectedRegionId && (
                                <div className="space-y-4 bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-500 font-bold border border-blue-600/30">🗳️ خول: {currentRound?.name}</span>
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600/15 text-emerald-500 font-bold border border-emerald-600/30">📍 لق: {currentBranches.find(b => b.id === selectedBranchId)?.name}</span>
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-600/15 text-amber-500 font-bold border border-amber-600/30">🏘️ ناوچە: {currentRegions.find(rg => rg.id === selectedRegionId)?.name}</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">کۆی دەنگدەران</label>
                                      <input
                                        type="number"
                                        value={regionMeta[selectedRegionId]?.totalVoters || ''}
                                        onChange={(e) => handleRegionMetaChange(selectedRegionId, 'totalVoters', Number(e.target.value))}
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                        disabled={currentUser?.role === 'viewer'}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">دەنگە دروستەکان</label>
                                      <input
                                        type="number"
                                        value={regionMeta[selectedRegionId]?.validVotes || ''}
                                        onChange={(e) => handleRegionMetaChange(selectedRegionId, 'validVotes', Number(e.target.value))}
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                        disabled={currentUser?.role === 'viewer'}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">دەنگە نادروستەکان</label>
                                      <input
                                        type="number"
                                        value={regionMeta[selectedRegionId]?.invalidVotes || ''}
                                        onChange={(e) => handleRegionMetaChange(selectedRegionId, 'invalidVotes', Number(e.target.value))}
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                        disabled={currentUser?.role === 'viewer'}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {currentRegionVotes.map(item => (
                                      <div key={item.partyId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-color)]">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                                          <span className="text-xs font-semibold break-words">{item.partyName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            value={item.votes || ''}
                                            onChange={(e) => handleVoteChange(selectedRegionId, item.partyId, Number(e.target.value))}
                                            className="w-full sm:w-24 bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-center font-bold focus:outline-none"
                                            disabled={currentUser?.role === 'viewer'}
                                          />
                                          <span className="text-xs text-[var(--text-secondary)] w-12 text-end">{item.percentage}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
                          تکایە سەرەتا لقێک لە لیستی لقەکان هەڵبژێرە.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMainTab === 'controlPanel' && (
            <div className="space-y-6">
              {currentUser.role === 'super_admin' && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                  <div className="border-b border-[var(--border-color)] pb-4">
                    <h2 className="text-lg sm:text-xl font-bold">{t.controlPanelTitle}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{t.controlPanelSubtitle}</p>
                  </div>

                  {accSuccessMsg && (
                    <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">
                      {accSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateAccount} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.fullNameLabel}</label>
                      <input
                        type="text"
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        placeholder="ئەدمینی لقی هەولێر..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.username}</label>
                      <input
                        type="text"
                        value={newAccUsername}
                        onChange={(e) => setNewAccUsername(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        placeholder="hawler_admin"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.password}</label>
                      <input
                        type="text"
                        value={newAccPassword}
                        onChange={(e) => setNewAccPassword(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                        placeholder="secret123"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.roleLabel}</label>
                      <select
                        value={newAccRole}
                        onChange={(e) => setNewAccRole(e.target.value as UserRole)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="branch_admin">{t.branchAdminRole}</option>
                        <option value="viewer">{t.viewerRole}</option>
                      </select>
                    </div>

                    {(newAccRole === 'branch_admin' || newAccRole === 'viewer') && (
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">لقی پەیوەندیدار</label>
                        <select
                          value={newAccBranchId || ''}
                          onChange={(e) => setNewAccBranchId(Number(e.target.value))}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none"
                          required
                        >
                          <option value="">{t.selectBranchPlaceholder}</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                    >
                      {t.createAccountBtn}
                    </button>
                  </form>

                  <div className="overflow-x-auto -mx-1 px-1">
                    <h3 className="font-bold text-sm mb-3">{t.accountsListTitle}</h3>
                    <table className="w-full min-w-[720px] text-start border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                          <th className="p-3 text-start">ناوی تەواو</th>
                          <th className="p-3 text-start">{t.username}</th>
                          <th className="p-3 text-start">{t.passwordDbHeader}</th>
                          <th className="p-3 text-start">{t.roleLabel}</th>
                          <th className="p-3 text-start">{t.linkedBranchHeader}</th>
                          <th className="p-3 text-center">{t.actionsHeader}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] text-sm">
                        {users.map(u => {
                          const linkedB = branches.find(b => b.id === u.branchId);
                          return (
                            <tr key={u.id} className="hover:bg-[var(--bg-hover)]">
                              <td className="p-3 font-semibold">{u.name}</td>
                              <td className="p-3 text-[var(--text-secondary)]">{u.username}</td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  defaultValue={u.password}
                                  onBlur={(e) => handleAdminUpdateUserPassword(u.id, e.target.value)}
                                  className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-2 py-1 text-xs w-full min-w-[6rem] max-w-[9rem] focus:outline-none"
                                />
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  u.role === 'super_admin' ? 'bg-purple-600/20 text-purple-400' : u.role === 'branch_admin' ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'
                                }`}>
                                  {u.role === 'super_admin' ? t.superAdmin : u.role === 'branch_admin' ? t.branchAdmin : t.viewer}
                                </span>
                              </td>
                              <td className="p-3 text-[var(--text-secondary)]">
                                {linkedB ? linkedB.name : t.generalOrNone}
                              </td>
                              <td className="p-3 text-center">
                                {u.id !== 1 && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-semibold transition"
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
              )}

              {currentUser.role === 'branch_admin' && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6 shadow-sm space-y-6 max-w-xl mx-auto">
                  <div className="border-b border-[var(--border-color)] pb-4">
                    <h2 className="text-xl font-bold">{t.changeMyPasswordTitle}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{t.changeMyPasswordSubtitle}</p>
                  </div>

                  {selfPasswordMsg && (
                    <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">
                      {selfPasswordMsg}
                    </div>
                  )}

                  <form onSubmit={handleUpdateMyPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t.newPasswordLabel}</label>
                      <input
                        type="text"
                        value={selfNewPassword}
                        onChange={(e) => setSelfNewPassword(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="پاسوۆردی نوێ بنووسە..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition"
                    >
                      {t.saveNewPasswordBtn}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeMainTab === 'reports' && currentUser.role !== 'viewer' && (
            <div className="space-y-6">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-[var(--border-color)] pb-4 print:hidden">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">{t.reportsTitle}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{t.reportsSubtitle}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <button
                      onClick={handlePrintReport}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      <span>{t.printReportBtn}</span>
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      <span>{t.downloadPdfBtn}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[var(--bg-main)] p-3 sm:p-4 rounded-xl border border-[var(--border-color)] print:hidden">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">خولی هەڵبژاردن</label>
                    <select
                      value={repSelectedRoundId || ''}
                      onChange={(e) => setRepSelectedRoundId(Number(e.target.value))}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                    >
                      {rounds.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.filterBranchLabel}</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsRepBranchOpen(!isRepBranchOpen)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold text-start flex justify-between items-center"
                      >
                        <span className="truncate">
                          {repSelectedBranchIds.length === 0 ? t.allBranchesOption : `${repSelectedBranchIds.length} لق دیاریکراوە`}
                        </span>
                        <span>▼</span>
                      </button>
                      {isRepBranchOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg p-2 space-y-1">
                          <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)] text-xs">
                            <button 
                              onClick={() => setRepSelectedBranchIds(repFilteredBranches.map(b => b.id))}
                              className="text-blue-500 hover:underline"
                            >
                              هەمووی هەڵبژێرە
                            </button>
                            <button 
                              onClick={() => setRepSelectedBranchIds([])}
                              className="text-red-400 hover:underline"
                            >
                              پاککردنەوە
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {repFilteredBranches.map(b => (
                              <label key={b.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-[var(--bg-hover)] rounded">
                                <input
                                  type="checkbox"
                                  checked={repSelectedBranchIds.includes(b.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setRepSelectedBranchIds([...repSelectedBranchIds, b.id]);
                                    } else {
                                      setRepSelectedBranchIds(repSelectedBranchIds.filter(id => id !== b.id));
                                    }
                                  }}
                                  className="rounded bg-[var(--bg-main)] text-blue-600"
                                />
                                <span>{b.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">{t.filterAreaLabel}</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsRepRegionOpen(!isRepRegionOpen)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-semibold text-start flex justify-between items-center"
                      >
                        <span className="truncate">
                          {repSelectedRegionIds.length === 0 ? t.allAreasOption : `${repSelectedRegionIds.length} ناوچە دیاریکراوە`}
                        </span>
                        <span>▼</span>
                      </button>
                      {isRepRegionOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg p-2 space-y-1">
                          <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)] text-xs">
                            <button 
                              onClick={() => setRepSelectedRegionIds(repFilteredRegions.map(r => r.id))}
                              className="text-blue-500 hover:underline"
                            >
                              هەمووی هەڵبژێرە
                            </button>
                            <button 
                              onClick={() => setRepSelectedRegionIds([])}
                              className="text-red-400 hover:underline"
                            >
                              پاککردنەوە
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {repFilteredRegions.map(reg => (
                              <label key={reg.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-[var(--bg-hover)] rounded">
                                <input
                                  type="checkbox"
                                  checked={repSelectedRegionIds.includes(reg.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setRepSelectedRegionIds([...repSelectedRegionIds, reg.id]);
                                    } else {
                                      setRepSelectedRegionIds(repSelectedRegionIds.filter(id => id !== reg.id));
                                    }
                                  }}
                                  className="rounded bg-[var(--bg-main)] text-blue-600"
                                />
                                <span>{reg.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div ref={reportRef} className="space-y-6 bg-[var(--bg-card)] p-3 sm:p-6 rounded-xl border border-[var(--border-color)] print:border-none print:p-0">
                  <div className="text-center space-y-2 border-b border-[var(--border-color)] pb-4">
                    <h2 className="text-xl font-bold">{t.systemTitle}</h2>
                    <p className="text-sm font-semibold text-blue-500">
                      {repSelectedRoundObj ? `${repSelectedRoundObj.name} - ${repSelectedRoundObj.date}` : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">{t.totalVotesLabel}</p>
                      <p className="text-lg font-bold">{totalReportVotes.toLocaleString()} دەنگ</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">جۆری خول</p>
                      <p className="text-lg font-bold">{repSelectedRoundObj?.type || '-'}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-start border-collapse border border-[var(--border-color)]">
                      <thead>
                        <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                          <th className="p-3 text-start border-e border-[var(--border-color)]">#</th>
                          <th className="p-3 text-start border-e border-[var(--border-color)]">{t.partyNameHeader}</th>
                          <th className="p-3 text-start border-e border-[var(--border-color)]">{t.votesCountLabel}</th>
                          <th className="p-3 text-start">{t.percentageLabel}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] text-sm">
                        {reportData.map((item, index) => (
                          <tr key={item.partyId} className="hover:bg-[var(--bg-hover)]">
                            <td className="p-3 border-e border-[var(--border-color)] text-[var(--text-secondary)]">{index + 1}</td>
                            <td className="p-3 border-e border-[var(--border-color)] font-semibold flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.hexColor }}></span>
                              <span>{item.partyName}</span>
                            </td>
                            <td className="p-3 border-e border-[var(--border-color)]">{item.votes.toLocaleString()}</td>
                            <td className="p-3 font-bold text-blue-500">{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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