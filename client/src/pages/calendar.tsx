import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CalendarView from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Event } from "@shared/schema";

export default function Calendar() {
  const [selectedView, setSelectedView] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch all family events
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Filter events by category
  const filteredEvents = events?.filter(event => 
    selectedCategory === "all" || event.category === selectedCategory
  ) || [];

  // Get upcoming events (next 7 days)
  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return eventDate >= now && eventDate <= weekFromNow;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work": return "💼";
      case "school": return "🎓";
      case "healthcare": return "🏥";
      case "social": return "🎉";
      case "travel": return "✈️";
      case "family": return "👨‍👩‍👧‍👦";
      case "sports": return "⚽";
      default: return "📅";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <CalendarIcon className="w-6 h-6 mr-2" />
                Family Calendar
              </h2>
              <p className="text-slate-600 mt-1">Manage your family's schedule and events</p>
            </div>
            <Button className="mt-4 sm:mt-0 bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <CalendarView 
              events={filteredEvents} 
              view={selectedView as "day" | "week" | "month"} 
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="text-lg">{getCategoryIcon(event.category)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{event.title}</h4>
                          <p className="text-sm text-slate-600">
                            {new Date(event.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-slate-500 truncate">{event.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Categories Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { category: 'work', label: 'Work', color: 'bg-blue-500' },
                    { category: 'school', label: 'School', color: 'bg-green-500' },
                    { category: 'healthcare', label: 'Healthcare', color: 'bg-red-500' },
                    { category: 'social', label: 'Social', color: 'bg-purple-500' },
                    { category: 'travel', label: 'Travel', color: 'bg-orange-500' },
                    { category: 'family', label: 'Family', color: 'bg-pink-500' },
                    { category: 'sports', label: 'Sports', color: 'bg-emerald-500' },
                  ].map(({ category, label, color }) => (
                    <div key={category} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="text-sm text-slate-700">{label}</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {filteredEvents.filter(e => e.category === category).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Events</span>
                    <span className="font-semibold">{upcomingEvents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Work Events</span>
                    <span className="font-semibold">
                      {upcomingEvents.filter(e => e.category === 'work').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Family Time</span>
                    <span className="font-semibold">
                      {upcomingEvents.filter(e => e.category === 'family').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
