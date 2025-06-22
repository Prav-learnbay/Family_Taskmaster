import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay } from "date-fns";
import type { Event } from "@shared/schema";

interface CalendarViewProps {
  events: Event[];
  view: "day" | "week" | "month";
}

export default function CalendarView({ events, view }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "prev" ? addDays(currentDate, -7) : addDays(currentDate, 7));
    } else {
      setCurrentDate(direction === "prev" ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };

  const getEventColor = (category: string) => {
    switch (category) {
      case "work": return "bg-blue-500 text-white";
      case "school": return "bg-green-500 text-white";
      case "healthcare": return "bg-red-500 text-white";
      case "social": return "bg-purple-500 text-white";
      case "travel": return "bg-orange-500 text-white";
      case "family": return "bg-pink-500 text-white";
      case "sports": return "bg-emerald-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const formatViewTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
    } else {
      return format(currentDate, "EEEE, MMMM dd, yyyy");
    }
  };

  // Month View
  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getEventsForDay = (day: Date) => {
      return events.filter(event => 
        isSameDay(new Date(event.startTime), day)
      );
    };

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-slate-100 p-3 text-center font-medium text-slate-700">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div 
              key={day.toString()} 
              className={`bg-white p-2 min-h-[120px] ${
                isCurrentMonth ? "" : "bg-slate-50 text-slate-400"
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isToday(day) ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center" : ""
              }`}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded truncate ${getEventColor(event.category)}`}
                    title={`${event.title} at ${format(new Date(event.startTime), "h:mm a")}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Week View
  const WeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getEventsForDayHour = (day: Date, hour: number) => {
      return events.filter(event => {
        const eventStart = new Date(event.startTime);
        return isSameDay(eventStart, day) && eventStart.getHours() === hour;
      });
    };

    return (
      <div className="grid grid-cols-8 gap-px bg-slate-200 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-100 p-3"></div>
        {weekDays.map(day => (
          <div key={day.toString()} className="bg-slate-100 p-3 text-center">
            <div className="font-medium text-slate-700">{format(day, "EEE")}</div>
            <div className={`text-lg ${isToday(day) ? "bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1" : ""}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
        
        {/* Time slots */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="bg-slate-100 p-2 text-center text-sm text-slate-600">
              {format(new Date().setHours(hour, 0, 0, 0), "h a")}
            </div>
            {weekDays.map(day => {
              const hourEvents = getEventsForDayHour(day, hour);
              return (
                <div key={`${day}-${hour}`} className="bg-white p-1 min-h-[60px] border-t border-slate-100">
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded mb-1 ${getEventColor(event.category)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="opacity-90">
                        {format(new Date(event.startTime), "h:mm a")}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Day View
  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const getEventsForHour = (hour: number) => {
      return dayEvents.filter(event => {
        const eventStart = new Date(event.startTime);
        return eventStart.getHours() === hour;
      });
    };

    return (
      <div className="space-y-px bg-slate-200 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div key={hour} className="grid grid-cols-4 gap-px">
              <div className="bg-slate-100 p-3 text-center text-sm text-slate-600">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </div>
              <div className="col-span-3 bg-white p-3 min-h-[80px]">
                <div className="space-y-2">
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`p-3 rounded-lg ${getEventColor(event.category)}`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm opacity-90 mt-1">
                        {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                      </div>
                      {event.location && (
                        <div className="text-sm opacity-80 mt-1">{event.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderView = () => {
    switch (view) {
      case "month": return <MonthView />;
      case "week": return <WeekView />;
      case "day": return <DayView />;
      default: return <MonthView />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>{formatViewTitle()}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderView()}
      </CardContent>
    </Card>
  );
}
