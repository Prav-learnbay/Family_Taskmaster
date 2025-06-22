import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import EisenhowerMatrix from "@/components/EisenhowerMatrix";
import FamilyMemberCard from "@/components/FamilyMemberCard";
import CalendarView from "@/components/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Calendar, 
  Star, 
  Plus,
  TrendingUp,
  Users,
  Target,
  Clock
} from "lucide-react";
import type { User, Task, Event } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch family stats
  const { data: familyStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/families/${user?.familyId}/stats`],
    enabled: !!user?.familyId,
  });

  // Fetch family members
  const { data: familyMembers, isLoading: membersLoading } = useQuery<User[]>({
    queryKey: [`/api/families/${user?.familyId}/members`],
    enabled: !!user?.familyId,
  });

  // Fetch today's events
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: todayEvents } = useQuery<Event[]>({
    queryKey: [`/api/events?startDate=${todayStart.toISOString()}&endDate=${todayEnd.toISOString()}`],
    enabled: !!user?.familyId,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getUserDisplayName = () => {
    const name = user.firstName || "User";
    return `${name}${user.role === "parent" ? " (Parent)" : user.role === "spouse" ? " (Spouse)" : ""}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                {getGreeting()}, {getUserDisplayName()}! 👋
              </h2>
              <p className="text-slate-600 mt-1">Here's what's happening with your family today</p>
            </div>
            <Button className="mt-4 sm:mt-0 bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Family Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Tasks</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {familyStats?.totalTasks || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="text-blue-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-slate-600 ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed Today</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {familyStats?.completedToday || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={familyStats?.completionRate || 0} 
                    className="h-2"
                  />
                  <span className="text-slate-600 text-sm mt-1">
                    {familyStats?.completionRate || 0}% completion rate
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Due This Week</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {familyStats?.dueThisWeek || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-orange-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-orange-600 font-medium">2 urgent</span>
                  <span className="text-slate-600 ml-1">need attention</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Family Score</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {Math.round((familyStats?.completionRate || 0) * 0.92)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="text-purple-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">Excellent!</span>
                  <span className="text-slate-600 ml-1">keep it up</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Family Members */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Family Members
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {familyMembers?.map((member) => (
              <FamilyMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Eisenhower Matrix */}
        <div className="mb-8">
          <EisenhowerMatrix />
        </div>

        {/* Calendar Preview and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Today's Schedule
              </CardTitle>
              <p className="text-sm text-slate-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayEvents && todayEvents.length > 0 ? (
                  todayEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          event.category === 'work' ? 'bg-blue-500' :
                          event.category === 'school' ? 'bg-green-500' :
                          event.category === 'healthcare' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div className="w-px h-8 bg-slate-200 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-900">{event.title}</h4>
                          <span className="text-sm text-slate-600">
                            {new Date(event.startTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-sm text-slate-600 mt-1">{event.location}</p>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 event-${event.category}`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No events scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Family Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Family Analytics</CardTitle>
              <p className="text-sm text-slate-600">This week's performance</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Task Completion Rate</span>
                    <span className="text-sm text-slate-600">{familyStats?.completionRate || 0}%</span>
                  </div>
                  <Progress value={familyStats?.completionRate || 0} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Family Collaboration</span>
                    <span className="text-sm text-slate-600">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Schedule Adherence</span>
                    <span className="text-sm text-slate-600">92%</span>
                  </div>
                  <Progress value={92} className="h-3" />
                </div>

                {/* Recent Achievements */}
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="text-yellow-600 text-xs" />
                      </div>
                      <span className="text-sm text-slate-600">Family achieved 90% completion rate!</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 text-xs" />
                      </div>
                      <span className="text-sm text-slate-600">Perfect attendance at scheduled events</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
