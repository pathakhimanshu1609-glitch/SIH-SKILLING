import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans relative">
      {/* Fixed Top Header — receives setActiveTab + activeTab for quick-access nav icons and secondary nav active state */}
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />

      {/* Main Body Container — pt-[100px] accounts for 64px primary + 36px secondary header rows */}
      <div className="flex flex-1 pt-[100px]">
        {/* Fixed Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Panel Area */}
        <main className="ml-64 flex-1 p-6 md:p-8 min-h-[calc(100vh-4rem)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
