import React, { useState } from "react";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

const Reports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");

  // Sample reports data
  const reports = [
    {
      id: 1,
      title: "Programming Fundamentals - Lab 2",
      course: "FA22-BCS-7B",
      type: "Lab Report",
      generatedDate: "2024-01-15",
      students: 32,
      submitted: 28,
      averageScore: 78.5,
      status: "completed",
      fileSize: "2.4 MB",
    },
    {
      id: 2,
      title: "Data Structures - Midterm",
      course: "FA22-BCS-5A",
      type: "Exam Report",
      generatedDate: "2024-01-10",
      students: 28,
      submitted: 28,
      averageScore: 82.3,
      status: "completed",
      fileSize: "1.8 MB",
    },
    {
      id: 3,
      title: "Web Development - Project 1",
      course: "SP23-BCS-3C",
      type: "Project Report",
      generatedDate: "2024-01-08",
      students: 25,
      submitted: 22,
      averageScore: 85.7,
      status: "completed",
      fileSize: "3.1 MB",
    },
    {
      id: 4,
      title: "Database Systems - Lab 4",
      course: "FA22-BCS-6A",
      type: "Lab Report",
      generatedDate: "2024-01-05",
      students: 30,
      submitted: 30,
      averageScore: 76.2,
      status: "completed",
      fileSize: "2.1 MB",
    },
    {
      id: 5,
      title: "Programming Fundamentals - Final",
      course: "FA22-BCS-7B",
      type: "Exam Report",
      generatedDate: "2024-01-20",
      students: 32,
      submitted: 0,
      averageScore: 0,
      status: "pending",
      fileSize: "0 MB",
    },
  ];

  // Stats data
  const stats = [
    {
      title: "Total Reports",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Students Assessed",
      value: "345",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Average Score",
      value: "79.2%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Submission Rate",
      value: "94%",
      change: "+5%",
      trend: "up",
      icon: BarChart3,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  const getStatusColor = (status) => {
    return status === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-yellow-100 text-yellow-700";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Lab Report":
        return "bg-blue-100 text-blue-700";
      case "Exam Report":
        return "bg-purple-100 text-purple-700";
      case "Project Report":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="text-indigo-600 font-bold text-xl flex items-center cursor-pointer"
              >
                <span className="text-2xl mr-1">&lt;/&gt;</span>
                <span>Codezy</span>
              </motion.div>
            </div>
            <div className="hidden md:flex space-x-8 font-medium">
              <a href="/teacher" className="hover:text-indigo-600 transition">
                Dashboard
              </a>
              <a href="/mycourses" className="hover:text-indigo-600 transition">
                My Courses
              </a>
              <a href="/createlab" className="hover:text-indigo-600 transition">
                Create Lab
              </a>
              <span className="text-indigo-600 border-b-2 border-indigo-600">
                Reports
              </span>
              <a href="profile" className="hover:text-indigo-600 transition">
                Profile
              </a>
              <a href="login" className="hover:text-indigo-600 transition">
                Logout
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Track student performance with style 🚀
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp size={16} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-500">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Recent Reports</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                className="p-6 transition rounded-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {report.title}
                      </h4>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status === "completed"
                          ? "Ready"
                          : "Processing"}
                      </motion.span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center space-x-1">
                        <FileText size={14} />
                        <span>{report.course}</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getTypeColor(
                          report.type
                        )}`}
                      >
                        {report.type}
                      </span>
                      <span>
                        Generated:{" "}
                        {new Date(report.generatedDate).toLocaleDateString()}
                      </span>
                      <span>{report.fileSize}</span>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Students: </span>
                        <span className="font-medium">{report.students}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted: </span>
                        <span className="font-medium">{report.submitted}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Average Score: </span>
                        <span className="font-medium">
                          {report.averageScore > 0
                            ? `${report.averageScore}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="View Report"
                    >
                      <Eye size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                        report.status === "completed"
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={report.status !== "completed"}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
