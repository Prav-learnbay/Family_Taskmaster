import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, 
  Star, 
  Trophy, 
  Calendar,
  CheckCircle,
  Target,
  Gift,
  Zap,
  Heart,
  Medal,
  Crown
} from "lucide-react";
import type { Task, Event, Achievement } from "@shared/schema";

interface ChildModeOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ChildModeOverlay({ isVisible, onClose }: ChildModeOverlayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only show for child users
  if (!isVisible || user?.role !== "child") {
    return null;
  }

  // Fetch child's tasks
  const { data: myTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks?assignee=me'],
    enabled: !!user && user.role === "child",
  });

  // Fetch child's upcoming events
  const { data: myEvents } = useQuery<Event[]>({
    queryKey: ['/api/events?user=me'],
    enabled: !!user && user.role === "child",
  });

  // Fetch achievements
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    enabled: !!user && user.role === "child",
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest('POST', `/api/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: (task) => {
      const pointsEarned = task.points || 0;
      toast({
        title: "🎉 Awesome Job!",
        description: pointsEarned > 0 ? 
          `Task completed! You earned ${pointsEarned} points!` : 
          "Task completed! Keep up the great work!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTaskComplete = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const getUserInitials = () => {
    return (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "");
  };

  const getUserLevel = () => {
    const points = user?.gamificationPoints || 0;
    return Math.floor(points / 100) + 1;
  };

  const getProgressToNextLevel = () => {
    const points = user?.gamificationPoints || 0;
    const currentLevelPoints = Math.floor(points / 100) * 100;
    const progressInLevel = points - currentLevelPoints;
    return Math.round((progressInLevel / 100) * 100);
  };

  const getTodayTasks = () => {
    if (!myTasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return myTasks.filter(task => {
      if (!task.dueDate) return true; // Tasks without due dates are considered "today"
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  };

  const getUpcomingEvents = () => {
    if (!myEvents) return [];
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    
    return myEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= now && eventDate <= weekFromNow;
    }).slice(0, 3);
  };

  const getEventEmoji = (category: string) => {
    switch (category) {
      case "school": return "🎓";
      case "sports": return "⚽";
      case "family": return "👨‍👩‍👧‍👦";
      case "social": return "🎉";
      default: return "📅";
    }
  };

  const todayTasks = getTodayTasks();
  const completedTodayTasks = todayTasks.filter(task => task.status === "completed");
  const upcomingEvents = getUpcomingEvents();
  const completionPercentage = todayTasks.length > 0 ? 
    Math.round((completedTodayTasks.length / todayTasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 child-mode-gradient z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Child Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "Child"} />
              <AvatarFallback className="text-lg font-bold">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 flex items-center">
                Hi {user?.firstName || "Kiddo"}! 🌟
              </h2>
              <p className="text-slate-700 text-lg">You're doing amazing today!</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            className="bg-white text-slate-700 shadow-lg hover:shadow-xl transition-shadow"
          >
            <X className="w-4 h-4 mr-2" />
            Back to Family View
          </Button>
        </div>

        {/* Child Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Target className="text-blue-500 mr-2" />
                My Tasks Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-slate-600">No tasks for today!</p>
                  <p className="text-slate-500 text-sm">Enjoy your free time!</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                      task.status === "completed" 
                        ? "bg-green-50 border-green-200" 
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => task.status !== "completed" && handleTaskComplete(task.id)}
                      className="w-6 h-6 text-green-600 rounded-lg"
                      disabled={task.status === "completed" || completeTaskMutation.isPending}
                    />
                    <span className={`text-slate-800 font-medium flex-1 ${
                      task.status === "completed" ? "line-through opacity-60" : ""
                    }`}>
                      {task.title}
                    </span>
                    {task.status === "completed" ? (
                      <Star className="text-yellow-400" />
                    ) : task.points && task.points > 0 ? (
                      <Badge className="bg-yellow-200 text-yellow-800 text-xs font-bold">
                        {task.points} pts
                      </Badge>
                    ) : null}
                  </div>
                ))
              )}
              
              {/* Progress Summary */}
              {todayTasks.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-slate-800">
                      {completedTodayTasks.length}/{todayTasks.length}
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                  <p className="text-xs text-slate-600 mt-1 text-center">
                    {completionPercentage === 100 ? "🎉 All done!" : "Keep going!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewards & Level */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Trophy className="text-yellow-500 mr-2" />
                My Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Level Display */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <p className="font-bold text-xl text-slate-800">Level {getUserLevel()}</p>
                <p className="text-sm text-slate-600 mb-2">
                  {user?.gamificationPoints || 0} total points
                </p>
                <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressToNextLevel()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600">
                  {100 - getProgressToNextLevel()} points to Level {getUserLevel() + 1}
                </p>
              </div>

              {/* Achievement Badges */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 text-center">My Badges</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <CheckCircle className="text-white" />
                    </div>
                    <span className="text-xs text-slate-600 font-medium">Helper</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Target className="text-white" />
                    </div>
                    <span className="text-xs text-slate-600 font-medium">Studious</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <Star className="text-white" />
                    </div>
                    <span className="text-xs text-slate-600 font-medium">Star Kid</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fun Calendar */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Calendar className="text-green-500 mr-2" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-slate-600">No upcoming events</p>
                  <p className="text-slate-500 text-sm">More time to play!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl ${
                        event.category === "school" ? "bg-green-50" :
                        event.category === "sports" ? "bg-blue-50" :
                        event.category === "family" ? "bg-purple-50" :
                        "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl">{getEventEmoji(event.category)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{event.title}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(event.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions for Kids */}
          <Card className="bg-white rounded-2xl shadow-lg md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Zap className="text-purple-500 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col bg-blue-100 hover:bg-blue-200 text-blue-800 border-2 border-blue-200">
                  <CheckCircle className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Check Tasks</span>
                </Button>
                <Button className="h-20 flex-col bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-200">
                  <Calendar className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">My Schedule</span>
                </Button>
                <Button className="h-20 flex-col bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-2 border-yellow-200">
                  <Trophy className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">My Rewards</span>
                </Button>
                <Button className="h-20 flex-col bg-purple-100 hover:bg-purple-200 text-purple-800 border-2 border-purple-200">
                  <Heart className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Family</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md mx-auto">
            <div className="text-4xl mb-2">🌟</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {completionPercentage === 100 ? "Perfect Day!" : 
               completionPercentage >= 75 ? "Almost There!" :
               completionPercentage >= 50 ? "Great Progress!" :
               "You've Got This!"}
            </h3>
            <p className="text-slate-600 text-sm">
              {completionPercentage === 100 ? "You completed all your tasks today! 🎉" :
               "Keep up the awesome work! Every task completed makes the family proud! 💪"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
