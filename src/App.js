import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import "@progress/kendo-theme-default/dist/all.css";

import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList, MultiSelect } from "@progress/kendo-react-dropdowns";
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartLegend,
  ChartTooltip
} from "@progress/kendo-react-charts";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
import { Card, CardBody, CardTitle } from "@progress/kendo-react-layout";
import { Loader } from "@progress/kendo-react-indicators";
import { Switch } from "@progress/kendo-react-inputs";
import { Badge, BadgeContainer } from "@progress/kendo-react-indicators";
import { Avatar } from "@progress/kendo-react-layout";
import { Drawer, DrawerContent } from "@progress/kendo-react-layout";

const translations = {
  en: {
    title: "💰 Smart Expense Tracker",
    themeLight: "🌞 Light",
    themeDark: "🌙 Dark",
    login: "🔐 Login",
    register: "📝 Register",
    logout: "🚪 Logout",
    add: "+ Add Expense",
    exportExcel: "📊 Excel",
    exportPDF: "📑 PDF",
    resetStats: "🔄 Reset",
    filters: "🔍 Filters",
    budgetSettings: "💰 Budget",
    search: "Search expenses...",
    category: "Category",
    newExpense: "New Expense",
    editExpense: "Edit Expense",
    save: "💾 Save",
    cancel: "❌ Cancel",
    delete: "🗑️ Delete",
    edit: "✏️ Edit",
    totalExpenses: "Total Expenses",
    mostExpCategory: "Top Category",
    purchaseCount: "Transactions",
    byCategory: "By Category",
    byMonth: "Monthly Trends",
    noData: "No expenses yet",
    name: "Name",
    amount: "Amount",
    date: "Date",
    description: "Description",
    actions: "Actions",
    budgetProgress: "Budget Progress",
    remainingBudget: "Remaining",
    currency: "Currency",
    monthlyLimit: "Monthly Budget",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    confirmPassword: "Confirm Password",
    frequency: "Frequency",
    tags: "Tags",
    receipt: "Receipt",
    priority: "Priority",
    dashboard: "Dashboard",
    expenses: "Expenses",
    goals: "Goals",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
    all: "All",
    minAmount: "Min Amount",
    maxAmount: "Max Amount",
    startDate: "Start Date",
    endDate: "End Date",
    goalTitle: "Goal Title",
    targetAmount: "Target Amount",
    currentProgress: "Current Progress",
    targetDate: "Target Date",
    addGoal: "Add Goal",
    editGoal: "Edit Goal",
    goalDescription: "Goal Description",
    notifications: {
      error: "❌ Budget exceeded!",
      warning: "⚠️ Almost reached limit!",
      success: "✅ Expense saved!",
      invalid: "❌ Please fill required fields",
      deleted: "🗑️ Expense deleted",
      updated: "🔄 Expense updated",
      loggedIn: "✅ Login successful",
      registered: "🎉 Registration successful",
      goalSaved: "🎯 Goal saved successfully",
      goalDeleted: "🗑️ Goal deleted"
    }
  }
};

const t = translations.en;

const categories = [
  "🍕 Food & Dining", 
  "🚗 Transportation", 
  "🏠 Housing", 
  "🛍️ Shopping", 
  "🎬 Entertainment", 
  "🏥 Healthcare", 
  "📦 Other"
];

const tags = [
  "Essential", "Luxury", "Business", "Personal", "Urgent", "Necessary", "Optional"
];

const frequencies = [
  "One-time", "Daily", "Weekly", "Monthly", "Yearly"
];

const priorities = [
  "Low", "Medium", "High", "Critical"
];

const currencies = [
  { text: "$ USD", value: "USD", rate: 1, symbol: "$" },
  { text: "€ EUR", value: "EUR", rate: 0.9, symbol: "€" },
  { text: "£ GBP", value: "GBP", rate: 0.8, symbol: "£" }
];

const menuItems = [
  { text: t.dashboard, icon: "k-i-chart", id: "dashboard" },
  { text: t.expenses, icon: "k-i-list", id: "expenses" },
  { text: t.goals, icon: "k-i-target", id: "goals" },
  { text: t.reports, icon: "k-i-file", id: "reports" },
  { text: t.settings, icon: "k-i-cog", id: "settings" }
];

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
}) : "";

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value,
    minimumFractionDigits: 2
  }).format(amount);
};

// Mock API Service
const apiService = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }
    const newUser = { 
      ...userData, 
      id: Date.now(), 
      createdAt: new Date().toISOString(),
      monthlyBudget: 1000,
      currency: currencies[0]
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  },

  syncExpenses: async (userId, expenses) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses));
    return expenses;
  },

  getExpenses: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
  },

  syncGoals: async (userId, goals) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem(`goals_${userId}`, JSON.stringify(goals));
    return goals;
  },

  getGoals: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return JSON.parse(localStorage.getItem(`goals_${userId}`) || '[]');
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  const [drawerExpanded, setDrawerExpanded] = useState(true);

  const [budget, setBudget] = useState(1000);
  const [currency, setCurrency] = useState(currencies[0]);
  const [darkMode, setDarkMode] = useState(false);

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    date: new Date(),
    category: categories[0],
    description: "",
    tags: [],
    frequency: "One-time",
    priority: "Medium"
  });

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    description: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    minAmount: "",
    maxAmount: "",
    startDate: null,
    endDate: null,
    tags: [],
    priority: "All"
  });

  const excelExportRef = useRef(null);
  const pdfExportRef = useRef(null);

  // Load user data on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setBudget(user.monthlyBudget || 1000);
      setCurrency(user.currency || currencies[0]);
    }
  }, []);

  // Load expenses and goals when user changes
  useEffect(() => {
    if (currentUser) {
      loadExpenses();
      loadGoals();
    }
  }, [currentUser]);

  const loadExpenses = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const userExpenses = await apiService.getExpenses(currentUser.id);
      setExpenses(userExpenses);
    } catch (error) {
      showNotification("error", "Failed to load expenses");
    }
    setIsLoading(false);
  }, [currentUser]);

  const loadGoals = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userGoals = await apiService.getGoals(currentUser.id);
      setGoals(userGoals);
    } catch (error) {
      showNotification("error", "Failed to load goals");
    }
  }, [currentUser]);

  const showNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await apiService.login(loginData.email, loginData.password);
      setCurrentUser(user);
      setBudget(user.monthlyBudget || 1000);
      setCurrency(user.currency || currencies[0]);
      localStorage.setItem('currentUser', JSON.stringify(user));
      showNotification("success", t.notifications.loggedIn);
    } catch (error) {
      showNotification("error", error.message);
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password.length < 6) {
      showNotification("error", "Password must be at least 6 characters");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      showNotification("error", "Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    try {
      const user = await apiService.register(registerData);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      showNotification("success", t.notifications.registered);
      setIsRegistering(false);
    } catch (error) {
      showNotification("error", error.message);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setExpenses([]);
    setGoals([]);
    setLoginData({ email: "", password: "" });
  };

  const saveUserSettings = () => {
    if (currentUser) {
      if (budget < total) {
        if (!window.confirm("Budget is less than current expenses. Continue?")) {
          return;
        }
      }
      
      const updatedUser = {
        ...currentUser,
        monthlyBudget: budget,
        currency: currency
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      showNotification("success", "Settings saved successfully");
    }
  };

  const addExpense = async () => {
    if (!newExpense.title.trim() || !newExpense.amount || Number(newExpense.amount) <= 0) {
      showNotification("error", t.notifications.invalid);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...newExpense,
        id: editingExpense?.id || Date.now(),
        amount: Number(newExpense.amount),
        date: newExpense.date instanceof Date 
          ? newExpense.date.toISOString() 
          : new Date(newExpense.date).toISOString(),
        currency: currency.value,
        userId: currentUser.id,
        createdAt: editingExpense?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedExpenses;
      if (editingExpense) {
        updatedExpenses = expenses.map(e => e.id === editingExpense.id ? payload : e);
        showNotification("success", t.notifications.updated);
      } else {
        updatedExpenses = [...expenses, payload];
        showNotification("success", t.notifications.success);
      }

      setExpenses(updatedExpenses);
      await apiService.syncExpenses(currentUser.id, updatedExpenses);
      
      setNewExpense({ 
        title: "", 
        amount: "", 
        date: new Date(), 
        category: categories[0], 
        description: "",
        tags: [],
        frequency: "One-time",
        priority: "Medium"
      });
      setOpenDialog(false);
      setEditingExpense(null);
    } catch (error) {
      showNotification("error", "Failed to save expense");
    }
    setIsLoading(false);
  };

  const addGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.targetAmount || Number(newGoal.targetAmount) <= 0) {
      showNotification("error", "Please fill required fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...newGoal,
        id: editingGoal?.id || Date.now(),
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount || 0),
        targetDate: newGoal.targetDate instanceof Date 
          ? newGoal.targetDate.toISOString() 
          : new Date(newGoal.targetDate).toISOString(),
        userId: currentUser.id,
        createdAt: editingGoal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedGoals;
      if (editingGoal) {
        updatedGoals = goals.map(g => g.id === editingGoal.id ? payload : g);
      } else {
        updatedGoals = [...goals, payload];
      }

      setGoals(updatedGoals);
      await apiService.syncGoals(currentUser.id, updatedGoals);
      
      setNewGoal({
        title: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: ""
      });
      setOpenGoalDialog(false);
      setEditingGoal(null);
      showNotification("success", t.notifications.goalSaved);
    } catch (error) {
      showNotification("error", "Failed to save goal");
    }
    setIsLoading(false);
  };

  const editExpense = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      title: expense.title,
      amount: expense.amount,
      date: new Date(expense.date),
      category: expense.category,
      description: expense.description || "",
      tags: expense.tags || [],
      frequency: expense.frequency || "One-time",
      priority: expense.priority || "Medium"
    });
    setOpenDialog(true);
  };

  const editGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: new Date(goal.targetDate),
      description: goal.description || ""
    });
    setOpenGoalDialog(true);
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        setExpenses(updatedExpenses);
        await apiService.syncExpenses(currentUser.id, updatedExpenses);
        showNotification("success", t.notifications.deleted);
      } catch (error) {
        showNotification("error", "Failed to delete expense");
      }
    }
  };

  const deleteGoal = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        const updatedGoals = goals.filter(g => g.id !== id);
        setGoals(updatedGoals);
        await apiService.syncGoals(currentUser.id, updatedGoals);
        showNotification("success", t.notifications.goalDeleted);
      } catch (error) {
        showNotification("error", "Failed to delete goal");
      }
    }
  };

  const resetStats = () => {
    if (window.confirm("This will delete ALL your expenses and goals. This action cannot be undone. Continue?")) {
      setExpenses([]);
      setGoals([]);
      apiService.syncExpenses(currentUser.id, []);
      apiService.syncGoals(currentUser.id, []);
      showNotification("success", "All data has been reset");
    }
  };

  // Memoized calculations
  const totalBase = useMemo(() => 
    expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), 
    [expenses]
  );
  
  const total = totalBase * currency.rate;
  const remainingBudget = Math.max(0, (budget * currency.rate) - total);
  const budgetPercentage = Math.min(100, (total / (budget * currency.rate)) * 100);

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                           (e.description && e.description.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesCategory = filters.category === "All" || e.category === filters.category;
      const matchesMinAmount = !filters.minAmount || e.amount >= Number(filters.minAmount);
      const matchesMaxAmount = !filters.maxAmount || e.amount <= Number(filters.maxAmount);
      const matchesDate = (!filters.startDate || new Date(e.date) >= new Date(filters.startDate)) &&
                         (!filters.endDate || new Date(e.date) <= new Date(filters.endDate));
      const matchesTags = filters.tags.length === 0 || 
                         (e.tags && filters.tags.some(tag => e.tags.includes(tag)));
      const matchesPriority = filters.priority === "All" || e.priority === filters.priority;

      return matchesSearch && matchesCategory && matchesMinAmount && 
             matchesMaxAmount && matchesDate && matchesTags && matchesPriority;
    }),
    [expenses, filters]
  );

  const displayedExpenses = useMemo(() =>
    filteredExpenses.map(e => ({
      ...e,
      amountConverted: Number((Number(e.amount || 0) * currency.rate).toFixed(2)),
      dateString: formatDate(e.date)
    })),
    [filteredExpenses, currency]
  );

  // Analytics calculations
  const categoryData = useMemo(() => {
    const map = {};
    displayedExpenses.forEach(e => {
      const key = e.category;
      map[key] = (map[key] || 0) + Number(e.amountConverted || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ 
        category, 
        amount: Number(amount.toFixed(2))
      }));
  }, [displayedExpenses]);

  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + Number(e.amount || 0);
    });
    return Object.keys(map)
      .sort()
      .slice(-6) // Last 6 months
      .map(k => {
        const [y, m] = k.split("-");
        const sampleDate = new Date(Number(y), Number(m) - 1, 1);
        return { 
          label: sampleDate.toLocaleString("en-US", { month: "short", year: "numeric" }), 
          value: Number((map[k] * currency.rate).toFixed(2)) 
        };
      });
  }, [expenses, currency]);

  const mostExpensiveCategory = useMemo(() => {
    if (categoryData.length === 0) return { category: "N/A", amount: 0 };
    return categoryData[0];
  }, [categoryData]);

  const goalProgress = useMemo(() => 
    goals.map(goal => ({
      ...goal,
      progress: Math.min(100, (Number(goal.currentAmount || 0) / Number(goal.targetAmount || 1)) * 100),
      daysRemaining: Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    })),
    [goals]
  );

  const themeStyles = {
    light: {
      background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
      text: "#1e293b",
      cardBg: "#ffffff",
      cardBorder: "#e2e8f0",
      cardShadow: "0 4px 20px rgba(0,0,0,0.08)",
      accent: "#3b82f6",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444"
    },
    dark: {
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      text: "#f1f5f9",
      cardBg: "#1e293b",
      cardBorder: "#334155",
      cardShadow: "0 4px 20px rgba(0,0,0,0.6)",
      accent: "#60a5fa",
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171"
    },
  };

  const currentTheme = darkMode ? themeStyles.dark : themeStyles.light;

  const renderContent = () => {
    switch (activeMenuItem) {
      case "expenses":
        return renderExpenses();
      case "goals":
        return renderGoals();
      case "reports":
        return renderReports();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Statistics Dashboard */}
      <div style={{ marginBottom: "25px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "15px" 
        }}>
          <Card style={{
            background: currentTheme.cardBg,
            boxShadow: currentTheme.cardShadow,
            borderRadius: "12px",
            padding: "15px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💰</div>
            <h3 style={{ margin: "0 0 8px 0", color: currentTheme.accent, fontSize: "1.1rem" }}>{t.totalExpenses}</h3>
            <p style={{ fontSize: "1.3rem", fontWeight: "bold", margin: 0 }}>
              {formatCurrency(total, currency)}
            </p>
          </Card>

          <Card style={{
            background: currentTheme.cardBg,
            boxShadow: currentTheme.cardShadow,
            borderRadius: "12px",
            padding: "15px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📊</div>
            <h3 style={{ margin: "0 0 8px 0", color: currentTheme.accent, fontSize: "1.1rem" }}>{t.purchaseCount}</h3>
            <p style={{ fontSize: "1.3rem", fontWeight: "bold", margin: 0 }}>
              {expenses.length}
            </p>
          </Card>

          <Card style={{
            background: currentTheme.cardBg,
            boxShadow: currentTheme.cardShadow,
            borderRadius: "12px",
            padding: "15px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎯</div>
            <h3 style={{ margin: "0 0 8px 0", color: currentTheme.accent, fontSize: "1.1rem" }}>{t.mostExpCategory}</h3>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", margin: 0 }}>
              {mostExpensiveCategory.category}
            </p>
            <p style={{ fontSize: "0.9rem", margin: "4px 0 0 0", color: currentTheme.text + "AA" }}>
              {formatCurrency(mostExpensiveCategory.amount, currency)}
            </p>
          </Card>

          <Card style={{
            background: currentTheme.cardBg,
            boxShadow: currentTheme.cardShadow,
            borderRadius: "12px",
            padding: "15px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🏆</div>
            <h3 style={{ margin: "0 0 8px 0", color: currentTheme.accent, fontSize: "1.1rem" }}>Active Goals</h3>
            <p style={{ fontSize: "1.3rem", fontWeight: "bold", margin: 0 }}>
              {goals.length}
            </p>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
          gap: "20px" 
        }}>
          {/* Pie Chart */}
          <Card style={{
            background: currentTheme.cardBg,
            boxShadow: currentTheme.cardShadow,
            borderRadius: "12px",
            padding: "20px"
          }}>
            <CardTitle style={{ textAlign: "center", fontSize: "1.2rem" }}>{t.byCategory}</CardTitle>
            <CardBody>
              {categoryData.length > 0 ? (
                <Chart style={{ height: "250px" }}>
                  <ChartLegend position="bottom" />
                  <ChartSeries>
                    <ChartSeriesItem 
                      type="pie" 
                      data={categoryData} 
                      categoryField="category" 
                      field="amount"
                      labels={{ 
                        visible: true, 
                        content: e => `${e.category}\n${formatCurrency(e.amount, currency)}`
                      }}
                    />
                  </ChartSeries>
                </Chart>
              ) : (
                <div style={{ textAlign: "center", padding: "30px", color: currentTheme.text + "80" }}>
                  No data available for chart
                </div>
              )}
            </CardBody>
          </Card>

          {/* Line Chart */}
          <Card style={{
            background: currentTheme.cardBg,
            boxShadow: currentTheme.cardShadow,
            borderRadius: "12px",
            padding: "20px"
          }}>
            <CardTitle style={{ textAlign: "center", fontSize: "1.2rem" }}>{t.byMonth}</CardTitle>
            <CardBody>
              {monthlyData.length > 0 ? (
                <Chart style={{ height: "250px" }}>
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem categories={monthlyData.map(d => d.label)} />
                  </ChartCategoryAxis>
                  <ChartValueAxis>
                    <ChartValueAxisItem labels={{ format: "{0}" }} />
                  </ChartValueAxis>
                  <ChartSeries>
                    <ChartSeriesItem 
                      type="line" 
                      data={monthlyData.map(d => d.value)} 
                      markers={{ visible: true }}
                    />
                  </ChartSeries>
                </Chart>
              ) : (
                <div style={{ textAlign: "center", padding: "30px", color: currentTheme.text + "80" }}>
                  No data available for chart
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );

  const renderExpenses = () => (
    <>
      {/* Filters Section */}
      <div style={{ marginBottom: "25px" }}>
        <Card style={{
          background: currentTheme.cardBg,
          boxShadow: currentTheme.cardShadow,
          borderRadius: "12px",
          padding: "20px"
        }}>
          <CardTitle style={{ fontSize: "1.2rem", marginBottom: "15px" }}>{t.filters}</CardTitle>
          <CardBody>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "15px" 
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                  🔍 {t.search}
                </label>
                <Input 
                  placeholder={t.search} 
                  value={filters.search} 
                  onChange={(e) => setFilters({...filters, search: e.value})}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                  📂 {t.category}
                </label>
                <DropDownList
                  data={["All", ...categories]}
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.value})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                  🏷️ {t.tags}
                </label>
                <MultiSelect
                  data={tags}
                  value={filters.tags}
                  onChange={(e) => setFilters({...filters, tags: e.value})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                  ⚡ {t.priority}
                </label>
                <DropDownList
                  data={["All", ...priorities]}
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.value})}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                  💰 Amount Range
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <NumericTextBox
                    placeholder="Min"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.value})}
                    style={{ flex: 1 }}
                  />
                  <NumericTextBox
                    placeholder="Max"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.value})}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                  📅 Date Range
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <DatePicker
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.value})}
                    style={{ flex: 1 }}
                  />
                  <DatePicker
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.value})}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Expenses Grid */}
      <div style={{ marginBottom: "25px" }}>
        <ExcelExport ref={excelExportRef} data={displayedExpenses}>
          <PDFExport ref={pdfExportRef} paperSize="A4" margin="1cm">
            {displayedExpenses.length === 0 ? (
              <Card style={{
                background: currentTheme.cardBg,
                boxShadow: currentTheme.cardShadow,
                borderRadius: "12px",
                textAlign: "center",
                padding: "40px 20px"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📊</div>
                <h3 style={{ color: currentTheme.text + "AA", marginBottom: "10px" }}>{t.noData}</h3>
                <p style={{ color: currentTheme.text + "80", marginBottom: "20px", fontSize: "14px" }}>
                  Start by adding your first expense
                </p>
                <Button 
                  onClick={() => setOpenDialog(true)} 
                  themeColor="primary"
                >
                  {t.add}
                </Button>
              </Card>
            ) : (
              <Grid
                data={displayedExpenses}
                style={{ 
                  background: currentTheme.cardBg, 
                  borderRadius: "12px",
                  overflow: "hidden"
                }}
                pageable={{ pageSizes: [5, 10, 20], buttonCount: 5 }}
                sortable
                size="medium"
              >
                <GridColumn field="title" title={t.name} width="200px" />
                <GridColumn 
                  field="amountConverted" 
                  title={t.amount} 
                  width="120px" 
                  cell={props => (
                    <td style={{ fontWeight: "bold", color: currentTheme.accent }}>
                      {formatCurrency(props.dataItem.amountConverted, currency)}
                    </td>
                  )}
                />
                <GridColumn 
                  field="category" 
                  title={t.category} 
                  width="150px"
                  cell={props => (
                    <td>
                      <BadgeContainer>
                        <Badge themeColor="primary" shape="rounded" size="small">
                          {props.dataItem.category}
                        </Badge>
                      </BadgeContainer>
                    </td>
                  )}
                />
                <GridColumn field="dateString" title={t.date} width="120px" />
                <GridColumn 
                  field="priority" 
                  title={t.priority} 
                  width="100px"
                  cell={props => (
                    <td>
                      <BadgeContainer>
                        <Badge 
                          themeColor={
                            props.dataItem.priority === "Critical" ? "error" :
                            props.dataItem.priority === "High" ? "warning" :
                            props.dataItem.priority === "Medium" ? "info" : "success"
                          } 
                          shape="rounded" 
                          size="small"
                        >
                          {props.dataItem.priority}
                        </Badge>
                      </BadgeContainer>
                    </td>
                  )}
                />
                <GridColumn 
                  field="tags" 
                  title={t.tags} 
                  width="150px"
                  cell={props => (
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
                        {props.dataItem.tags?.map((tag, index) => (
                          <Badge key={index} themeColor="secondary" size="small" style={{ fontSize: "10px" }}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  )}
                />
                <GridColumn 
                  field="actions" 
                  title={t.actions} 
                  width="150px"
                  cell={props => (
                    <td>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <Button
                          themeColor="primary"
                          size="small"
                          onClick={() => editExpense(props.dataItem)}
                        >
                          {t.edit}
                        </Button>
                        <Button
                          themeColor="error"
                          size="small"
                          onClick={() => deleteExpense(props.dataItem.id)}
                        >
                          {t.delete}
                        </Button>
                      </div>
                    </td>
                  )}
                />
              </Grid>
            )}
          </PDFExport>
        </ExcelExport>

        <div style={{ 
          marginTop: "15px", 
          display: "flex", 
          gap: "10px", 
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <Button 
            onClick={() => excelExportRef.current?.save()} 
            themeColor="success"
            size="small"
          >
            {t.exportExcel}
          </Button>
          <Button 
            onClick={() => pdfExportRef.current?.save()} 
            themeColor="warning"
            size="small"
          >
            {t.exportPDF}
          </Button>
          <Button 
            onClick={() => setOpenDialog(true)} 
            themeColor="primary"
            size="small"
          >
            {t.add}
          </Button>
          <Button 
            onClick={resetStats} 
            themeColor="error"
            size="small"
          >
            {t.resetStats}
          </Button>
        </div>
      </div>
    </>
  );

  const renderGoals = () => (
    <div style={{ marginBottom: "25px" }}>
      <Card style={{
        background: currentTheme.cardBg,
        boxShadow: currentTheme.cardShadow,
        borderRadius: "12px",
        padding: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <CardTitle style={{ fontSize: "1.2rem", margin: 0 }}>🎯 Financial Goals</CardTitle>
          <Button 
            onClick={() => setOpenGoalDialog(true)}
            themeColor="primary"
            size="small"
          >
            + Add Goal
          </Button>
        </div>

        <CardBody>
          {goalProgress.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: currentTheme.text + "80" }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎯</div>
              <h3 style={{ marginBottom: "10px" }}>No goals yet</h3>
              <p style={{ marginBottom: "20px" }}>Set your financial goals to track your progress</p>
              <Button 
                onClick={() => setOpenGoalDialog(true)}
                themeColor="primary"
              >
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {goalProgress.map(goal => (
                <Card key={goal.id} style={{
                  background: currentTheme.cardBg,
                  border: `1px solid ${currentTheme.cardBorder}`,
                  borderRadius: "8px",
                  padding: "15px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", color: currentTheme.accent }}>{goal.title}</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: currentTheme.text + "AA" }}>
                        {goal.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Button
                        themeColor="primary"
                        size="small"
                        onClick={() => editGoal(goal)}
                      >
                        Edit
                      </Button>
                      <Button
                        themeColor="error"
                        size="small"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "14px" }}>Progress</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                      </span>
                    </div>
                    <ProgressBar
                      value={goal.progress}
                      style={{ height: "8px", borderRadius: "4px" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: currentTheme.text + "AA" }}>
                    <span>Target: {formatDate(goal.targetDate)}</span>
                    <span>{goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Target date passed'}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div style={{ marginBottom: "25px" }}>
      <Card style={{
        background: currentTheme.cardBg,
        boxShadow: currentTheme.cardShadow,
        borderRadius: "12px",
        padding: "20px"
      }}>
        <CardTitle style={{ fontSize: "1.2rem", marginBottom: "15px" }}>📈 Advanced Reports</CardTitle>
        <CardBody>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {/* Spending by Priority */}
            <Card style={{ padding: "15px", textAlign: "center" }}>
              <h4 style={{ marginBottom: "15px" }}>Spending by Priority</h4>
              <Chart style={{ height: "200px" }}>
                <ChartSeries>
                  <ChartSeriesItem 
                    type="donut" 
                    data={priorities.map(priority => ({
                      category: priority,
                      value: displayedExpenses
                        .filter(e => e.priority === priority)
                        .reduce((sum, e) => sum + e.amountConverted, 0)
                    }))} 
                    categoryField="category" 
                    field="value"
                  />
                </ChartSeries>
              </Chart>
            </Card>

            {/* Monthly Comparison */}
            <Card style={{ padding: "15px", textAlign: "center" }}>
              <h4 style={{ marginBottom: "15px" }}>Monthly Comparison</h4>
              <Chart style={{ height: "200px" }}>
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem categories={monthlyData.map(d => d.label)} />
                </ChartCategoryAxis>
                <ChartValueAxis>
                  <ChartValueAxisItem />
                </ChartValueAxis>
                <ChartSeries>
                  <ChartSeriesItem 
                    type="column" 
                    data={monthlyData.map(d => d.value)} 
                  />
                </ChartSeries>
              </Chart>
            </Card>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div style={{ marginBottom: "25px" }}>
      <Card style={{
        background: currentTheme.cardBg,
        boxShadow: currentTheme.cardShadow,
        borderRadius: "12px",
        padding: "20px"
      }}>
        <CardTitle style={{ fontSize: "1.2rem", marginBottom: "15px" }}>⚙️ Application Settings</CardTitle>
        <CardBody>
          <div style={{ display: "grid", gap: "20px" }}>
            <div>
              <h4 style={{ marginBottom: "10px" }}>Theme Settings</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>Current theme: {darkMode ? "Dark" : "Light"}</span>
                <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: "10px" }}>Data Management</h4>
              <Button onClick={resetStats} themeColor="error" size="small">
                Reset All Data
              </Button>
              <p style={{ fontSize: "12px", color: currentTheme.text + "AA", marginTop: "5px" }}>
                This will delete all your expenses and goals. This action cannot be undone.
              </p>
            </div>

            <div>
              <h4 style={{ marginBottom: "10px" }}>Export Data</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button 
                  onClick={() => excelExportRef.current?.save()} 
                  themeColor="success"
                  size="small"
                >
                  Export to Excel
                </Button>
                <Button 
                  onClick={() => pdfExportRef.current?.save()} 
                  themeColor="warning"
                  size="small"
                >
                  Export to PDF
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  if (!currentUser) {
    return (
      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: currentTheme.background,
        color: currentTheme.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <Card style={{
          width: "100%",
          maxWidth: "400px",
          background: currentTheme.cardBg,
          boxShadow: currentTheme.cardShadow,
          borderRadius: "12px"
        }}>
          <CardBody>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h1 style={{ 
                margin: "0 0 10px 0",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2rem"
              }}>
                {t.title}
              </h1>
              <p style={{ color: currentTheme.text + "80", fontSize: "14px" }}>
                {isRegistering ? "Create your account" : "Sign in to your account"}
              </p>
            </div>

            {isRegistering ? (
              <form onSubmit={handleRegister}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Input
                    placeholder={t.fullName}
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({...registerData, fullName: e.value})}
                    required
                  />
                  <Input
                    type="email"
                    placeholder={t.email}
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.value})}
                    required
                  />
                  <Input
                    type="password"
                    placeholder={t.password}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.value})}
                    required
                  />
                  <Input
                    type="password"
                    placeholder={t.confirmPassword}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.value})}
                    required
                  />
                  <Button
                    type="submit"
                    themeColor="primary"
                    style={{ width: "100%" }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader size="small" /> : t.register}
                  </Button>
                  <Button
                    onClick={() => setIsRegistering(false)}
                    style={{ width: "100%" }}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Input
                    type="email"
                    placeholder={t.email}
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.value})}
                    required
                  />
                  <Input
                    type="password"
                    placeholder={t.password}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.value})}
                    required
                  />
                  <Button
                    type="submit"
                    themeColor="primary"
                    style={{ width: "100%" }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader size="small" /> : t.login}
                  </Button>
                  <Button
                    onClick={() => setIsRegistering(true)}
                    style={{ width: "100%" }}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        <NotificationGroup style={{ position: "fixed", top: "20px", right: "20px" }}>
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              type={{ style: notification.type, icon: true }}
              closable={true}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              style={{ marginBottom: "10px", minWidth: "300px" }}
            >
              <span style={{ fontWeight: "500" }}>{notification.message}</span>
            </Notification>
          ))}
        </NotificationGroup>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: currentTheme.background,
      color: currentTheme.text,
      minHeight: "100vh",
      display: "flex"
    }}>
      {/* Drawer Navigation */}
      <Drawer 
        expanded={drawerExpanded} 
        position="start" 
        mode="push"
        style={{ width: drawerExpanded ? "250px" : "60px" }}
      >
        <DrawerContent style={{ 
          padding: "20px 0", 
          background: currentTheme.cardBg,
          borderRight: `1px solid ${currentTheme.cardBorder}`
        }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "5px",
            padding: "0 15px"
          }}>
            {menuItems.map(item => (
              <Button 
                key={item.id}
                look="flat"
                themeColor={activeMenuItem === item.id ? "primary" : "base"}
                style={{ 
                  justifyContent: "flex-start",
                  padding: "10px 15px",
                  height: "auto",
                  minHeight: "44px"
                }}
                onClick={() => setActiveMenuItem(item.id)}
              >
                <span 
                  className={`k-icon ${item.icon}`} 
                  style={{ 
                    marginRight: drawerExpanded ? "12px" : "0",
                    minWidth: "20px"
                  }}
                ></span>
                {drawerExpanded && item.text}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <Button 
                icon="menu"
                look="flat"
                onClick={() => setDrawerExpanded(!drawerExpanded)}
              />
              <h1 style={{ 
                margin: 0, 
                fontSize: "1.8rem", 
                fontWeight: "bold",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                {t.title}
              </h1>
            </div>
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <Avatar type="text" shape="circle" style={{ backgroundColor: currentTheme.accent }}>
                {currentUser.fullName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
              </Avatar>
              <span style={{ fontWeight: "500", fontSize: "14px" }}>
                {currentUser.fullName || currentUser.email}
              </span>
              <Button 
                onClick={() => setDarkMode(!darkMode)} 
                themeColor={darkMode ? "light" : "dark"}
                size="small"
              >
                {darkMode ? t.themeLight : t.themeDark}
              </Button>
              <Button 
                onClick={handleLogout}
                themeColor="error"
                size="small"
              >
                {t.logout}
              </Button>
            </div>
          </div>
        </div>

        {/* Budget Section */}
        {activeMenuItem === "dashboard" && (
          <div style={{ marginBottom: "25px" }}>
            <Card style={{
              background: currentTheme.cardBg,
              boxShadow: currentTheme.cardShadow,
              borderRadius: "12px",
              padding: "20px"
            }}>
              <CardTitle style={{ fontSize: "1.2rem", marginBottom: "15px" }}>{t.budgetSettings}</CardTitle>
              <CardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                      {t.monthlyLimit}
                    </label>
                    <NumericTextBox 
                      value={budget} 
                      onChange={(e) => setBudget(e.value || 0)}
                      style={{ width: "100%" }}
                      min={0}
                      format="n2"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                      {t.currency}
                    </label>
                    <DropDownList
                      data={currencies}
                      textField="text"
                      dataItemKey="value"
                      value={currency}
                      onChange={(e) => setCurrency(e.value)}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "end" }}>
                    <Button onClick={saveUserSettings} themeColor="primary" style={{ width: "100%" }}>
                      💾 Save Settings
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginBottom: "8px",
                    fontSize: "14px"
                  }}>
                    <span>{t.budgetProgress}</span>
                    <span style={{ 
                      color: budgetPercentage > 90 ? currentTheme.error : 
                            budgetPercentage > 75 ? currentTheme.warning : currentTheme.success,
                      fontWeight: "600"
                    }}>
                      {budgetPercentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <ProgressBar
                    value={total}
                    min={0}
                    max={budget * currency.rate}
                    style={{ 
                      height: "10px",
                      borderRadius: "5px",
                      marginBottom: "8px"
                    }}
                  />
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    fontSize: "14px"
                  }}>
                    <span>
                      {t.totalExpenses}: {formatCurrency(total, currency)}
                    </span>
                    <span style={{ color: currentTheme.success, fontWeight: "600" }}>
                      {t.remainingBudget}: {formatCurrency(remainingBudget, currency)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Main Content Area */}
        {renderContent()}
      </div>

      {/* Add/Edit Expense Dialog */}
      {openDialog && (
        <Dialog 
          title={editingExpense ? t.editExpense : t.newExpense} 
          onClose={() => {
            setOpenDialog(false);
            setEditingExpense(null);
            setNewExpense({ 
              title: "", 
              amount: "", 
              date: new Date(), 
              category: categories[0], 
              description: "",
              tags: [],
              frequency: "One-time",
              priority: "Medium"
            });
          }}
          width={450}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px 0" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.name} *
              </label>
              <Input
                placeholder="e.g., Groceries, Rent"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.value })}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.amount} *
              </label>
              <NumericTextBox
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.value })}
                style={{ width: "100%" }}
                min={0}
                format="n2"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                  {t.date}
                </label>
                <DatePicker
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.value })}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                  {t.category}
                </label>
                <DropDownList
                  data={categories}
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.value })}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                  {t.priority}
                </label>
                <DropDownList
                  data={priorities}
                  value={newExpense.priority}
                  onChange={(e) => setNewExpense({ ...newExpense, priority: e.value })}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                  {t.frequency}
                </label>
                <DropDownList
                  data={frequencies}
                  value={newExpense.frequency}
                  onChange={(e) => setNewExpense({ ...newExpense, frequency: e.value })}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.tags}
              </label>
              <MultiSelect
                data={tags}
                value={newExpense.tags}
                onChange={(e) => setNewExpense({ ...newExpense, tags: e.value })}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.description}
              </label>
              <Input
                placeholder="Optional notes..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.value })}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <DialogActionsBar>
            {isLoading && <Loader size="small" type="infinite-spinner" />}
            <Button
              onClick={() => {
                setOpenDialog(false);
                setEditingExpense(null);
                setNewExpense({ 
                  title: "", 
                  amount: "", 
                  date: new Date(), 
                  category: categories[0], 
                  description: "",
                  tags: [],
                  frequency: "One-time",
                  priority: "Medium"
                });
              }}
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
            <Button
              themeColor="primary"
              onClick={addExpense}
              disabled={isLoading || !newExpense.title.trim() || !newExpense.amount}
            >
              {isLoading ? "Saving..." : t.save}
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}

      {/* Add/Edit Goal Dialog */}
      {openGoalDialog && (
        <Dialog 
          title={editingGoal ? t.editGoal : t.addGoal} 
          onClose={() => {
            setOpenGoalDialog(false);
            setEditingGoal(null);
            setNewGoal({
              title: "",
              targetAmount: "",
              currentAmount: "",
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              description: ""
            });
          }}
          width={450}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px 0" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.goalTitle} *
              </label>
              <Input
                placeholder="e.g., New Car, Vacation"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.value })}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                  {t.targetAmount} *
                </label>
                <NumericTextBox
                  placeholder="0.00"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.value })}
                  style={{ width: "100%" }}
                  min={0}
                  format="n2"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                  {t.currentProgress}
                </label>
                <NumericTextBox
                  placeholder="0.00"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.value })}
                  style={{ width: "100%" }}
                  min={0}
                  format="n2"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.targetDate}
              </label>
              <DatePicker
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.value })}
                style={{ width: "100%" }}
                min={new Date()}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>
                {t.goalDescription}
              </label>
              <Input
                placeholder="Describe your goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.value })}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <DialogActionsBar>
            {isLoading && <Loader size="small" type="infinite-spinner" />}
            <Button
              onClick={() => {
                setOpenGoalDialog(false);
                setEditingGoal(null);
                setNewGoal({
                  title: "",
                  targetAmount: "",
                  currentAmount: "",
                  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  description: ""
                });
              }}
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
            <Button
              themeColor="primary"
              onClick={addGoal}
              disabled={isLoading || !newGoal.title.trim() || !newGoal.targetAmount}
            >
              {isLoading ? "Saving..." : t.save}
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}

      {/* Notifications */}
      <NotificationGroup style={{ position: "fixed", top: "20px", right: "20px" }}>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={{ style: notification.type, icon: true }}
            closable={true}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            style={{ marginBottom: "10px", minWidth: "300px" }}
          >
            <span style={{ fontWeight: "500" }}>{notification.message}</span>
          </Notification>
        ))}
      </NotificationGroup>
    </div>
  );
}

export default App;