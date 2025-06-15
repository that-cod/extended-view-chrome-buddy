
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Upload as UploadIcon,
  BookOpen,
  User
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Upload", url: "/upload", icon: UploadIcon },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Profile", url: "/profile", icon: User },
];

export default function AppSidebar() {
  const location = useLocation();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Trader Behavioral Insights</SidebarGroupLabel>
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
    </Sidebar>
  );
}
