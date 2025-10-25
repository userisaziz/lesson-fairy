'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';

export default function DesignExample() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Design System Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Example */}
        <Card className="shadow-[0_3px_10px_rgb(0,0,0,0.08)] border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Lesson Card</CardTitle>
            <CardDescription className="text-gray-600">
              This is an example of a lesson card with consistent styling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              This card demonstrates the consistent design principles applied throughout the application.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Ready
              </span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                Image
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              View Details
            </Button>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              Start Lesson
            </Button>
          </CardFooter>
        </Card>

        {/* Form Example */}
        <Card className="shadow-[0_3px_10px_rgb(0,0,0,0.08)] border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Lesson Generator</CardTitle>
            <CardDescription className="text-gray-600">
              Create a new lesson with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Topic
                </label>
                <textarea
                  id="topic"
                  placeholder="What would you like to learn about?"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'History', 'Science', 'Art'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
              Generate Lesson
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Button Examples */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-gray-900 text-white hover:bg-gray-800">
            Primary Button
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Secondary Button
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
            Ghost Button
          </Button>
        </div>
      </div>
    </div>
  );
}