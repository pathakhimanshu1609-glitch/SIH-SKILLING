import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-roboto">
      {/* Fixed Top Header */}
      <Header />

      {/* Main Body Container */}
      <div className="flex flex-1 pt-16">
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
