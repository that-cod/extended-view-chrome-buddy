
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Journal from "./pages/Journal";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AppSidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <div className="bg-[#171b22] min-h-screen flex w-full">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <SidebarTrigger />
              <main className="flex-1 p-6 bg-[#171b22] text-white min-h-screen rounded-lg shadow overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
