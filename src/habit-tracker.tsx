"use client";
import type React from "react";
import { v4 as uuidv4 } from "uuid";
import { useState, useRef, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle,
  ChevronDown,
  Droplets,
  Dumbbell,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Smartphone,
  Book,
  BookOpen,
  Coffee,
  Heart,
  Phone,
  Bed,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Types
type Habit = {
  id: string;
  name: string;
  icon: React.ReactNode;
  completed: boolean;
  target: number;
  current: number;
  unit: string;
  color: string;
};

type Goal = {
  id: string;
  name: string;
  icon: React.ReactNode;
  target: number;
  progress: number; // e.g., 3 (out of 5 books)
  daysLeft: number;
  status: "on-track" | "at-risk" | "behind";
  linkedHabitIds?: string[]; // habit IDs contributing to this goal
  unit?: string; // e.g., "books", "kg", etc.
};

// Sample data
const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Drink Water",
    icon: <Droplets className="h-5 w-5 text-blue-500" />,
    completed: false,
    target: 8,
    current: 6,
    unit: "glasses",
    color: "text-blue-500",
  },
  {
    id: "2",
    name: "Sleep",
    icon: <Moon className="h-5 w-5 text-indigo-500" />,
    completed: true,
    target: 8,
    current: 7.5,
    unit: "hours",
    color: "text-indigo-500",
  },
  {
    id: "3",
    name: "Screen Time",
    icon: <Smartphone className="h-5 w-5 text-rose-500" />,
    completed: false,
    target: 3,
    current: 2.5,
    unit: "hours",
    color: "text-rose-500",
  },
  {
    id: "4",
    name: "Exercise",
    icon: <Dumbbell className="h-5 w-5 text-green-500" />,
    completed: false,
    target: 30,
    current: 15,
    unit: "minutes",
    color: "text-green-500",
  },
];

const initialGoals: Goal[] = [
  {
    id: "1",
    name: "Drink 8 glasses of water daily for 30 days",
    icon: <Droplets className="h-5 w-5 text-blue-500" />,
    target: 30,
    progress: 70,
    daysLeft: 9,
    status: "on-track",
    linkedHabitIds: ["1"],
    unit: "days",
  },
  {
    id: "2",
    name: "Sleep 8 hours every night for 2 weeks",
    icon: <Moon className="h-5 w-5 text-indigo-500" />,
    target: 14,
    progress: 85,
    daysLeft: 2,
    status: "on-track",
    linkedHabitIds: ["2"],
    unit: "days",
  },
  {
    id: "3",
    name: "Reduce screen time to 2 hours daily",
    icon: <Smartphone className="h-5 w-5 text-rose-500" />,
    target: 30, // Assuming a month-long goal
    progress: 40,
    daysLeft: 0,
    status: "at-risk",
    linkedHabitIds: ["3"],
    unit: "days",
  },
  {
    id: "4",
    name: "Exercise 30 minutes daily for 21 days",
    icon: <Dumbbell className="h-5 w-5 text-green-500" />,
    target: 21,
    progress: 25,
    daysLeft: 16,
    status: "behind",
    linkedHabitIds: ["4"],
    unit: "days",
  },
  {
    id: "5",
    name: "Read 20 minutes daily for a month",
    icon: <Book className="h-5 w-5 text-amber-500" />,
    target: 30,
    progress: 60,
    daysLeft: 12,
    status: "on-track",
    linkedHabitIds: [], // optional if not linked
    unit: "days",
  },
];

const weeklyProgressData = [
  { name: "Mon", completed: 5, total: 8 },
  { name: "Tue", completed: 7, total: 8 },
  { name: "Wed", completed: 6, total: 8 },
  { name: "Thu", completed: 8, total: 8 },
  { name: "Fri", completed: 7, total: 8 },
  { name: "Sat", completed: 6, total: 8 },
  { name: "Sun", completed: 4, total: 8 },
];

const statsData = [
  { date: "Week 1", sleep: 7.2, water: 6.5, screen: 3.2 },
  { date: "Week 2", sleep: 7.5, water: 7.0, screen: 2.8 },
  { date: "Week 3", sleep: 8.0, water: 7.5, screen: 2.5 },
  { date: "Week 4", sleep: 7.8, water: 8.0, screen: 2.2 },
  { date: "Week 5", sleep: 7.9, water: 7.8, screen: 2.0 },
  { date: "Week 6", sleep: 8.2, water: 8.0, screen: 1.8 },
];

// Calendar data
const completedDates = [
  new Date(2024, 4, 1),
  new Date(2024, 4, 2),
  new Date(2024, 4, 3),
  new Date(2024, 4, 5),
  new Date(2024, 4, 6),
  new Date(2024, 4, 8),
  new Date(2024, 4, 9),
  new Date(2024, 4, 10),
  new Date(2024, 4, 11),
  new Date(2024, 4, 12),
  new Date(2024, 4, 13),
  new Date(2024, 4, 14),
  new Date(2024, 4, 15),
  new Date(2024, 4, 16),
  new Date(2024, 4, 17),
  new Date(2024, 4, 18),
  new Date(2024, 4, 19),
];

const partialDates = [
  new Date(2024, 4, 4),
  new Date(2024, 4, 7),
  new Date(2024, 4, 20),
];

// Custom Tailwind Components

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const getSelectedLabels = () => {
    return options
      .filter((opt) => selectedValues.includes(opt.value))
      .map((opt) => opt.label);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="w-full border border-gray-300 rounded px-3 py-2 text-left bg-white"
      >
        {selectedValues.length > 0 ? (
          <span>{getSelectedLabels().join(", ")}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleValue(option.value)}
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
    icon: "p-2",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Progress({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      ></div>
    </div>
  );
}

function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    outline: "bg-white border border-gray-300 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function TabPanel({
  id,
  activeTab,
  children,
}: {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}) {
  if (id !== activeTab) return null;
  return <div className="py-4">{children}</div>;
}

function Checkbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
  id?: string;
}) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {label && (
        <label htmlFor={id} className="ml-2 text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
}

function Dropdown({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
}

function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <div
              key={option.value}
              className={`relative cursor-default select-none py-2 pl-3 pr-9 ${
                value === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-900"
              } hover:bg-blue-600 hover:text-white`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}: {
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Close on "Escape" key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}

function Calendar({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const isCompleted = (date: Date) => {
    return completedDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
  };

  const isPartial = (date: Date) => {
    return partialDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <button
                onClick={() => onChange(day)}
                className={`w-full h-full flex items-center justify-center rounded-full text-sm ${
                  isSelected(day)
                    ? "bg-blue-600 text-white"
                    : isCompleted(day)
                    ? "bg-green-500 text-white"
                    : isPartial(day)
                    ? "bg-amber-500 text-white"
                    : isToday(day)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {day.getDate()}
              </button>
            ) : (
              <div className="w-full h-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Components
function StreakCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function WeeklyProgressChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyProgressData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
            }}
            formatter={(value) => [`${value} habits`]}
          />
          <Bar
            dataKey="total"
            fill="#e2e8f0"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Bar
            dataKey="completed"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatsChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={statsData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="water"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="screen"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DailyGoals({ habits }: { habits: Habit[] }) {
  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="flex items-center gap-4">
          {habit.icon}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{habit.name}</span>
              <span className="text-sm text-gray-500">
                {habit.current}/{habit.target} {habit.unit}
              </span>
            </div>
            <Progress value={(habit.current / habit.target) * 100} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewGoalForm({ habits, onCreate }: Props2) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("times");
  const [daysLeft, setDaysLeft] = useState("");
  const [linkedHabits, setLinkedHabits] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const unitOptions = [
    { value: "books", label: "Books" },
    { value: "kg", label: "Kilograms" },
    { value: "hours", label: "Hours" },
    { value: "times", label: "Times" },
  ];

  const handleCreate = () => {
    if (!name || !target || !daysLeft) return;

    let goalIcon: React.ReactNode = <MoreHorizontal />;
    if (linkedHabits.length > 0) {
      const firstLinkedHabit = habits.find(
        (habit) => habit.id === linkedHabits[0]
      );
      if (firstLinkedHabit) goalIcon = firstLinkedHabit.icon;
    }
    const newGoal: Goal = {
      id: uuidv4(),
      name,
      icon: goalIcon,
      target: Number(target),
      progress: 0,
      daysLeft: Number(daysLeft),
      status: "on-track",
      linkedHabitIds: linkedHabits,
      unit,
    };

    setShowSuccess(true);
    onCreate(newGoal);
    setTimeout(() => setShowSuccess(false), 3000);

    setName("");
    setTarget("");
    setDaysLeft("");
    setLinkedHabits([]);
    setUnit("times");
  };

  const habitOptions = habits.map((habit) => ({
    value: habit.id,
    label: habit.name,
  }));

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-md"
          >
            🎯 Goal created successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="max-w-2xl mx-auto overflow-visible">
        <CardHeader>
          <CardTitle>Create a new goal</CardTitle>
          <CardDescription>
            Set a goal and optionally connect it to your habits
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 5 books"
              className="h-10 px-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="h-10 px-4"
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                options={unitOptions}
                value={unit}
                onChange={(value) => setUnit(value)}
                placeholder="Select Unit"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Days Left</Label>
            <Input
              id="deadline"
              type="number"
              value={daysLeft}
              onChange={(e) => setDaysLeft(e.target.value)}
              className="h-10 px-4"
              placeholder="e.g. 30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linked-habits">Linked Habits (optional)</Label>
            <MultiSelect
              options={habitOptions}
              selectedValues={linkedHabits}
              onChange={(values: string[]) => setLinkedHabits(values)}
              placeholder="Select related habits"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setName("")}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Goal</Button>
        </CardFooter>
      </Card>
    </>
  );
}

function HabitList({
  habits,
  setHabits,
}: {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const incrementHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id && habit.current < habit.target
          ? {
              ...habit,
              current: habit.current + (habit.name === "Drink Water" ? 1 : 0.5),
            }
          : habit
      )
    );
  };
  function handleEditSubmit() {
    if (editingHabit) {
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === editingHabit.id ? editingHabit : habit
        )
      );
      setEditingHabit(null);
    }
  }
  function deleteHabit(id: string) {
    setHabits(habits.filter((habit) => habit.id !== id));
  }
  return (
    <>
      <div className="space-y-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center justify-between space-x-4 rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              {habit.icon}
              <div>
                <p className="text-sm font-medium leading-none">{habit.name}</p>
                <p className="text-sm text-gray-500">
                  {habit.current}/{habit.target} {habit.unit}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 md:w-40">
                <Progress value={(habit.current / habit.target) * 100} />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementHabit(habit.id)}
              >
                +
              </Button>
              <Checkbox
                checked={habit.completed}
                onChange={() => toggleHabit(habit.id)}
              />
              <Dropdown
                trigger={
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              >
                <div className="py-1">
                  <DropdownItem onClick={() => setEditingHabit(habit)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    className="text-red-600"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    Delete
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
      >
        {editingHabit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full mt-1 border p-2 rounded"
                type="text"
                value={editingHabit.name}
                onChange={(e) =>
                  setEditingHabit({ ...editingHabit, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target</label>
              <input
                className="w-full mt-1 border p-2 rounded"
                type="number"
                value={editingHabit.target}
                onChange={(e) =>
                  setEditingHabit({
                    ...editingHabit,
                    target: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <input
                className="w-full mt-1 border p-2 rounded"
                type="text"
                value={editingHabit.unit}
                onChange={(e) =>
                  setEditingHabit({ ...editingHabit, unit: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditingHabit(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

function GoalsList({
  goals,
  setGoals,
}: {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const getStatusBadge = (status: Goal["status"]) => {
    switch (status) {
      case "on-track":
        return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
      case "at-risk":
        return <Badge className="bg-amber-100 text-amber-800">At Risk</Badge>;
      case "behind":
        return <Badge className="bg-red-100 text-red-800">Behind</Badge>;
    }
  };
  function handleDelete(id: string) {
    setGoals(goals.filter((goal) => goal.id !== id));
  }
  function handleEditSubmit() {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal))
      );
      setEditingGoal(null);
    }
  }
  return (
    <>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {goal.icon}
                <h3 className="font-medium">{goal.name}</h3>
              </div>
              <Dropdown
                trigger={
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              >
                <div className="py-1">
                  <DropdownItem onClick={() => setEditingGoal(goal)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    className="text-red-600"
                    onClick={() => handleDelete(goal.id)}
                  >
                    Delete
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Target: {goal.target}
                </span>
                {goal.daysLeft > 0 && (
                  <span className="text-sm text-gray-500">
                    • {goal.daysLeft} days left
                  </span>
                )}
              </div>
              {getStatusBadge(goal.status)}
            </div>
            <Progress value={goal.progress} />
          </div>
        ))}
      </div>
      <Modal
        isOpen={editingGoal !== null}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
      >
        {editingGoal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full mt-1 border p-2 rounded"
                type="text"
                value={editingGoal.name}
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target</label>
              <input
                type="number"
                className="w-full mt-1 border p-2 rounded"
                value={editingGoal.target}
                onChange={(e) =>
                  setEditingGoal({
                    ...editingGoal,
                    target: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <input
                className="w-full mt-1 border p-2 rounded"
                type="text"
                value={editingGoal.unit}
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, unit: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditingGoal(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

function HabitCalendar() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Calendar value={date} onChange={setDate} />
      </div>
      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-sm">All habits completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
          <span className="text-sm">Some habits completed</span>
        </div>
      </div>
      {date && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Water Intake</span>
                <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Sleep</span>
                <Badge className="bg-indigo-100 text-indigo-800">
                  Completed
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Screen Time</span>
                <Badge className="bg-rose-100 text-rose-800">Completed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Exercise</span>
                <Badge variant="outline" className="text-gray-500">
                  Missed
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Reading</span>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type Props = {
  onCreate: (habit: Habit) => void;
};

type Props2 = {
  onCreate: (goal: Goal) => void;
  habits: Habit[];
};

function NewHabitForm({ onCreate }: Props) {
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState("water");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("glasses");
  const [showSuccess, setShowSuccess] = useState(false);

  const habitOptions = [
    { value: "water", label: "Water Intake" },
    { value: "sleep", label: "Sleep" },
    { value: "screen", label: "Screen Time" },
    { value: "exercise", label: "Exercise" },
    { value: "reading", label: "Reading" },
    { value: "coffee", label: "Coffee" },
    { value: "health", label: "Health" },
    { value: "other", label: "Other" },
  ];

  const unitOptions = [
    { value: "glasses", label: "Glasses" },
    { value: "hours", label: "Hours" },
    { value: "minutes", label: "Minutes" },
    { value: "times", label: "Times" },
    { value: "steps", label: "Steps" },
  ];

  const colorMap: Record<string, string> = {
    water: "#3b82f6",
    sleep: "#8b5cf6",
    screen: "#f59e0b",
    exercise: "#10b981",
    reading: "#6366f1",
    coffee: "#a16207",
    health: "#ef4444",
    other: "#9ca3af",
  };

  const iconMap: Record<string, React.ReactNode> = {
    water: <Droplets />,
    sleep: <Bed />,
    screen: <Phone />,
    exercise: <Dumbbell />,
    reading: <BookOpen />,
    coffee: <Coffee />,
    health: <Heart />,
    other: <MoreHorizontal />,
  };

  function handleCreate() {
    if (!habitName || !target) return;

    const newHabit: Habit = {
      id: uuidv4(),
      name: habitName,
      icon: iconMap[habitType],
      completed: false,
      current: 0,
      target: Number(target),
      unit,
      color: colorMap[habitType],
    };
    setShowSuccess(true);
    onCreate(newHabit);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    setHabitName("");
    setTarget("");
    setUnit("glasses");
    setHabitType("water");
  }

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-md"
          >
            🎉 Habit created successfully!
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="max-w-2xl mx-auto overflow-visible">
        <CardHeader>
          <CardTitle>Create a new habit</CardTitle>
          <CardDescription>
            Add a new habit to track in your daily routine
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2 ">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder=" e.g. Drink Water"
              className="h-10 px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Habit Type</Label>
            <div className="h-10">
              <Select
                options={habitOptions}
                value={habitType}
                onChange={(value) => {
                  setHabitType(value);
                }}
                placeholder="Select Habit Type"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 ">
              <Label htmlFor="target">Target Value</Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="h-10 px-4"
                placeholder="e.g. 8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <div className="h-10 ">
                <Select
                  options={unitOptions}
                  value={unit}
                  onChange={(value) => setUnit(value)}
                  placeholder="Select Unit"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">Reminder (optional)</Label>
            <div className="flex items-center space-x-2">
              <Input type="time" className="h-10 px-4" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setHabitName("")}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Habit</Button>
        </CardFooter>
      </Card>
    </>
  );
}

// Main App Component
export default function HabitTracker() {
  const [activeView, setActiveView] = useState("dashboard");
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleCreateGoal(newGoal: Goal) {
    setGoals([...goals, newGoal]);
  }
  function handleOnCreate(newHabit: Habit) {
    setHabits([...habits, newHabit]);
  }
  // Render the appropriate view based on activeView state
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StreakCard
                title="Current Streak"
                value="12 days"
                description="Keep it up!"
              />
              <StreakCard
                title="Completion Rate"
                value="87%"
                description="Last 30 days"
              />
              <StreakCard
                title="Habits Tracked"
                value={habits.length.toString()}
                description="Active habits"
              />
              <StreakCard
                title="Goals Achieved"
                value="24"
                description="This month"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>
                    Your habit completion over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <WeeklyProgressChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Today&apos;s Goals</CardTitle>
                  <CardDescription>
                    Your daily targets and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyGoals habits={habits} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Habits</CardTitle>
                  <CardDescription>
                    Track your daily habits and check them off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitList habits={habits} setHabits={setHabits} />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "habits":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Habits</h2>
              <Button onClick={() => setActiveView("newHabit")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Habit
              </Button>
            </div>
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle>Your Habits</CardTitle>
                <CardDescription>
                  Track your daily habits and check them off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HabitList habits={habits} setHabits={setHabits} />
              </CardContent>
            </Card>
          </div>
        );
      case "stats":
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
            <Tabs
              tabs={[
                { id: "overview", label: "Overview" },
                { id: "habits", label: "By Habit" },
                { id: "calendar", label: "Calendar" },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
            <TabPanel id="overview" activeTab={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>
                    Your habit completion rate over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <StatsChart />
                </CardContent>
              </Card>
            </TabPanel>
            <TabPanel id="habits" activeTab={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Habit Performance</CardTitle>
                  <CardDescription>
                    Detailed statistics for each habit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habits.map((habit) => (
                      <div key={habit.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          {habit.icon}
                          <span className="font-medium">{habit.name}</span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Current Progress</span>
                            <span className="text-sm font-medium">
                              {habit.current}/{habit.target} {habit.unit}
                            </span>
                          </div>
                          <Progress
                            value={(habit.current / habit.target) * 100}
                          />
                        </div>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={statsData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                              />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Line
                                type="monotone"
                                dataKey={
                                  habit.name === "Sleep"
                                    ? "sleep"
                                    : habit.name === "Drink Water"
                                    ? "water"
                                    : "screen"
                                }
                                stroke={
                                  habit.color.includes("blue")
                                    ? "#3b82f6"
                                    : habit.color.includes("indigo")
                                    ? "#6366f1"
                                    : "#f43f5e"
                                }
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabPanel>
            <TabPanel id="calendar" activeTab={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Habit Calendar</CardTitle>
                  <CardDescription>
                    View your habit completion by date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitCalendar />
                </CardContent>
              </Card>
            </TabPanel>
          </div>
        );
      case "goals":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
              <Button onClick={() => setActiveView("newGoal")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>
                  Track your progress towards your habit goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList goals={goals} setGoals={setGoals} />
              </CardContent>
            </Card>
          </div>
        );
      case "newHabit":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                Add New Habit
              </h2>
              <Button variant="outline" onClick={() => setActiveView("habits")}>
                Back to Habits
              </Button>
            </div>
            <NewHabitForm onCreate={handleOnCreate} />
          </div>
        );
      case "newGoal":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                Add New Goal
              </h2>
              <Button variant="outline" onClick={() => setActiveView("goals")}>
                Back to Goals
              </Button>
            </div>
            <NewGoalForm habits={habits} onCreate={handleCreateGoal} />
          </div>
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 ">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">HabitTracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`text-sm font-medium ${
                activeView === "dashboard"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView("habits")}
              className={`text-sm font-medium ${
                activeView === "habits"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Habits
            </button>
            <button
              onClick={() => setActiveView("goals")}
              className={`text-sm font-medium ${
                activeView === "goals"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveView("stats")}
              className={`text-sm font-medium ${
                activeView === "stats"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Stats
            </button>
          </nav>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-16 right-0 left-0 bg-white shadow-md z-20">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setActiveView("dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("habits");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Habits
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("goals");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Goals
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("stats");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Stats
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1  bg-gray-50">
        <div className="container mx-auto py-6 px-4 ">{renderView()}</div>
      </main>
    </div>
  );
}
