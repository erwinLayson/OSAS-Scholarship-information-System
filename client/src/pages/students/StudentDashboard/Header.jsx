import React from "react";

const Header = ({ activeView, studentData }) => (
  <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900 capitalize">{activeView}</h1>
        <p className="text-sm text-gray-500">Welcome to your student portal</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{studentData?.name || 'Student'}</p>
          <p className="text-xs text-gray-500">Student</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
          {studentData?.name?.[0]?.toUpperCase() || 'S'}
        </div>
      </div>
    </div>
  </header>
);

export default Header;
