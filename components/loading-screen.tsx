'use client';

import { Brain, Heart, Shield } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 burnout-gradient rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-full shadow-lg">
            <Brain className="w-16 h-16 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Burnout Monitor</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your AI-powered wellness companion is initializing...
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Wellness Tracking</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Privacy Protected</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}