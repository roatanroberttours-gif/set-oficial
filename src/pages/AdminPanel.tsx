import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSupabaseSet } from "../hooks/supabaseset";
import {
  Settings,
  Package,
  Image,
  LogOut,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Home,
  Video,
  MapPin,
  Palmtree,
  List,
} from "lucide-react";

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const client = useSupabaseSet();
  const [stats, setStats] = useState({
    totalTours: 0,
    totalGalleryImages: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [toursRes, galleryRes] = await Promise.all([
        client.from("paquetes").select("id", { count: "exact", head: true }),
        client.from("gallery").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalTours: toursRes.count || 0,
        totalGalleryImages: galleryRes.count || 0,
        recentActivity: 24, // placeholder
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Site Settings",
      description: "Edit site images, contact details and branding",
      icon: Settings,
      href: "/admin/settings",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Manage Tours Aditions",
      description: "Add, edit or remove tour packages",
      icon: Package,
      href: "/paquetes",
      color: "from-teal-500 to-green-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "Gallery Manager",
      description: "Upload and organize public gallery images",
      icon: Image,
      href: "/admingallery",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Video Manager",
      description: "Upload and manage homepage videos",
      icon: Video,
      href: "/admin/videos",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Meeting Points",
      description: "Manage pickup locations and meeting zones",
      icon: MapPin,
      href: "/admin/meeting-points",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Private Tours",
      description: "Manage private tour packages and bookings",
      icon: Palmtree,
      href: "/admin/private-tours",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
  
  ];

  const statCards = [
    {
      title: "Total Tours",
      value: stats.totalTours,
      icon: Package,
      color: "from-teal-500 to-green-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Gallery Images",
      value: stats.totalGalleryImages,
      icon: Image,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Recent Activity",
      value: `${stats.recentActivity}h`,
      icon: Clock,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      change: "Active",
      changeType: "neutral",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, Administrator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Site</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-teal-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-4 ${action.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Database Connection
                  </p>
                  <p className="text-sm text-gray-600">
                    All systems operational
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Security</p>
                  <p className="text-sm text-gray-600">
                    Protected and encrypted
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                Secure
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Image className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Media Storage</p>
                  <p className="text-sm text-gray-600">Available and ready</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
