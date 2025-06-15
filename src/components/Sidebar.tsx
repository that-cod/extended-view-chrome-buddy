
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Upload as UploadIcon,
  BookOpen,
  User,
  LogOut,
  Mail
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ContactEmailModal from "./ui/ContactEmailModal";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Upload", url: "/upload", icon: UploadIcon },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Profile", url: "/profile", icon: User },
];

export default function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showContact, setShowContact] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>NevUp</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 border-t border-gray-700">
          <div className="mb-3">
            <div className="text-sm font-medium text-white">
              {user?.name || user?.email}
            </div>
            <div className="text-xs text-gray-400">
              {user?.email}
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm" 
            className="w-full mb-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button 
            onClick={() => setShowContact(true)}
            variant="outline"
            size="sm"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 mt-1"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
          {showContact && (
            <ContactEmailModal open={showContact} onOpenChange={setShowContact} />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
