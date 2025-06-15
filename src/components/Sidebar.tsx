
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
  CircleArrowUp,
  CircleArrowDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

// Edit or add icons/routes as needed
const items = [
  { title: "Dashboard", url: "/", icon: CircleArrowUp },
  { title: "Upload", url: "/upload", icon: CircleArrowDown },
  { title: "Journal", url: "/journal", icon: ChevronDown },
  { title: "Profile", url: "/profile", icon: ChevronUp },
];

export default function AppSidebar() {
  const location = useLocation();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
