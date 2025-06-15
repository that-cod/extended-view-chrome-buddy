
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
                {/* Placeholder for dashboard content */}
                <div className="max-w-7xl mx-auto space-y-8">
                  <h1 className="text-2xl font-bold mb-2">Today's Emotional State</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Example summary cards */}
                    <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
                      <span className="text-gray-300">Emotional Balance</span>
                      <div className="text-3xl font-bold">67<span className="text-base font-normal text-gray-400">/100</span></div>
                      <span className="text-green-400 text-sm mt-1">&#8593; 0.56% From Yesterday</span>
                    </div>
                    <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
                      <span className="text-gray-300">FOMO Risk</span>
                      <div className="text-3xl font-bold">67<span className="text-base font-normal text-gray-400">/100</span></div>
                      <span className="text-red-400 text-sm mt-1">&#8595; 0.56% From Yesterday</span>
                    </div>
                    <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
                      <span className="text-gray-300">Decision Conf.</span>
                      <div className="text-3xl font-bold">67<span className="text-base font-normal text-gray-400">/100</span></div>
                      <span className="text-red-400 text-sm mt-1">&#8595; 0.56% From Yesterday</span>
                    </div>
                  </div>
                  {/* Placeholder: Add chart dashboard, tagging buttons, summary tables here */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="col-span-2 bg-[#232833] rounded-lg p-5 shadow min-h-[220px]">
                      {/* Chart placeholder */}
                      <div className="h-44 flex items-center justify-center text-gray-400">
                        [Line Chart: Emotional State Progress]
                      </div>
                    </div>
                    <div className="bg-[#232833] rounded-lg p-5 shadow h-full">
                      <h2 className="text-lg font-bold mb-3">Emotional Tagging</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {["Confident", "Fearful", "Cautious", "FOMO", "Patient", "Excited", "Greedy", "Focused", "Anxious"].map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-lg bg-[#1c2027] text-xs text-white text-center border border-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-[#232833] rounded-lg p-5 shadow min-h-[200px]">
                      <h2 className="text-lg font-bold mb-2">Daily Summary</h2>
                      {/* Table placeholder */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-200">
                          <thead>
                            <tr>
                              <th className="p-2 text-left">Date</th>
                              <th className="p-2 text-left">Trades</th>
                              <th className="p-2 text-left">Lots</th>
                              <th className="p-2 text-left">Results</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-gray-800">
                              <td className="p-2">08/10/2025</td>
                              <td className="p-2">3</td>
                              <td className="p-2">2.23</td>
                              <td className="p-2 text-green-400">6.36%</td>
                            </tr>
                            <tr className="border-t border-gray-800">
                              <td className="p-2">09/10/2025</td>
                              <td className="p-2">4</td>
                              <td className="p-2">2.13</td>
                              <td className="p-2 text-green-400">6.36%</td>
                            </tr>
                            <tr className="border-t border-gray-800">
                              <td className="p-2">10/10/2025</td>
                              <td className="p-2">5</td>
                              <td className="p-2">4.70</td>
                              <td className="p-2 text-green-400">6.36%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="bg-[#232833] rounded-lg p-5 shadow min-h-[200px] flex flex-col justify-between">
                      <h2 className="text-lg font-bold mb-2">Pattern Recognition</h2>
                      {/* Pattern table placeholder */}
                      <div>
                        <div className="flex justify-between mb-2 text-gray-400">
                          <span>Emotional Impact</span>
                          <span>Last 30 Days</span>
                        </div>
                        <div className="flex justify-between py-1 border-t border-gray-800">
                          <span>Patient Trader</span>
                          <span className="text-green-400">6.36%</span>
                        </div>
                        <div className="flex justify-between py-1 border-t border-gray-800">
                          <span>FOMO Traders</span>
                          <span className="text-green-400">6.36%</span>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        AI Insight:<br />
                        You overtrade by <span className="text-green-400">45%</span> on days following losses, typically with higher risk positions.
                      </div>
                      <button className="mt-4 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors">
                        Get Personalized Strategy
                      </button>
                    </div>
                  </div>
                </div>
                {/* END dashboard shell */}
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
