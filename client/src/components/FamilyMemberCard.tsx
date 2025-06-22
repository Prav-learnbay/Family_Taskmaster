import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Trophy, 
  Medal, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Heart,
  Crown,
  Settings,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { User, Task } from "@shared/schema";

interface FamilyMemberCardProps {
  member: User;
}

export default function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  // Fetch member's tasks
  const { data: memberTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { assignee: member.id }],
    queryKey: [`/api/tasks?assignee=${member.id}`],
    enabled: !!member.id,
  });

  const getUserInitials = () => {
    return (member.firstName?.[0] || "") + (member.lastName?.[0] || "");
  };

  const getUserDisplayName = () => {
    return member.firstName || "Family Member";
  };

  const getRoleDisplayName = () => {
    switch (member.role) {
      case "parent": return "Parent (Admin)";
      case "spouse": return "Spouse";
      case "child": 
        const age = member.dateOfBirth ? 
          new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear() : null;
        return `Child${age ? ` (${age} years)` : ""}`;
      default: return member.role;
    }
  };

  const getOnlineStatus = () => {
    // This would typically come from real-time presence data
    // For now, we'll simulate based on role
    const statuses = ["Active now", "Active 5m ago", "At school", "Active 1h ago"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const calculateTodayProgress = () => {
    if (!memberTasks) return { completed: 0, total: 0, percentage: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = memberTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
    
    const completedTasks = todayTasks.filter(task => task.status === "completed");
    const percentage = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;
    
    return {
      completed: completedTasks.length,
      total: todayTasks.length,
      percentage
    };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getUserLevel = () => {
    const points = member.gamificationPoints || 0;
    return Math.floor(points / 100) + 1;
  };

  const getProgressToNextLevel = () => {
    const points = member.gamificationPoints || 0;
    const currentLevelPoints = Math.floor(points / 100) * 100;
    const progressInLevel = points - currentLevelPoints;
    return Math.round((progressInLevel / 100) * 100);
  };

  const getTags = () => {
    const tags = [];
    if (member.role === "parent") {
      tags.push({ icon: <Briefcase className="w-3 h-3" />, label: "Work", color: "bg-blue-100 text-blue-800" });
      tags.push({ icon: <Home className="w-3 h-3" />, label: "Home", color: "bg-green-100 text-green-800" });
    } else if (member.role === "spouse") {
      tags.push({ icon: <Heart className="w-3 h-3" />, label: "Health", color: "bg-purple-100 text-purple-800" });
      tags.push({ icon: <GraduationCap className="w-3 h-3" />, label: "School", color: "bg-yellow-100 text-yellow-800" });
    } else if (member.role === "child") {
      return null; // Children get special badges instead
    }
    return tags;
  };

  const getChildBadges = () => {
    if (member.role !== "child") return null;
    
    const badges = [
      { icon: <Star className="w-3 h-3 text-white" />, color: "bg-yellow-400", label: "Star Kid" },
      { icon: <Medal className="w-3 h-3 text-white" />, color: "bg-blue-400", label: "Studious" },
      { icon: <Trophy className="w-3 h-3 text-white" />, color: "bg-green-400", label: "Helper" },
    ];
    
    return badges;
  };

  const todayProgress = calculateTodayProgress();
  const isChild = member.role === "child";
  const tags = getTags();
  const childBadges = getChildBadges();

  return (
    <Card className={`relative overflow-hidden ${isChild ? "bg-gradient-to-br from-yellow-50 to-orange-50" : "bg-white"}`}>
      {/* Child-specific decoration */}
      {isChild && (
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full"></div>
        </div>
      )}
      
      <CardContent className="pt-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className={`w-12 h-12 ${isChild ? "border-2 border-yellow-300" : ""}`}>
              <AvatarImage src={member.profileImageUrl || ""} alt={getUserDisplayName()} />
              <AvatarFallback className="text-sm font-medium">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-slate-900 flex items-center">
                {getUserDisplayName()}
                {member.role === "parent" && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
              </h4>
              <p className="text-sm text-slate-600">{getRoleDisplayName()}</p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  getOnlineStatus().includes("Active now") ? "bg-green-400" :
                  getOnlineStatus().includes("school") ? "bg-yellow-400" :
                  "bg-gray-400"
                }`}></div>
                <span className="text-xs text-slate-500">{getOnlineStatus()}</span>
              </div>
            </div>
          </div>
          
          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              {member.role !== "parent" && (
                <DropdownMenuItem>
                  Assign Tasks
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          {/* Progress Section */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Today's Tasks</span>
            <span className="text-sm font-medium">
              {todayProgress.completed}/{todayProgress.total}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isChild ? "bg-yellow-400" : 
                  member.role === "spouse" ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${todayProgress.percentage}%` }}
              ></div>
            </div>
            
            {/* Child Level Progress */}
            {isChild && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Level {getUserLevel()}</span>
                <span className="font-medium text-yellow-600">
                  {getProgressToNextLevel()}% to next level
                </span>
              </div>
            )}
          </div>

          {/* Tags or Badges */}
          {isChild ? (
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {childBadges?.map((badge, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 ${badge.color} rounded-full flex items-center justify-center`}
                    title={badge.label}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-yellow-600">Level {getUserLevel()}</span>
            </div>
          ) : (
            tags && (
              <div className="flex space-x-2">
                {tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className={`inline-flex items-center text-xs font-medium ${tag.color}`}
                  >
                    {tag.icon}
                    <span className="ml-1">{tag.label}</span>
                  </Badge>
                ))}
              </div>
            )
          )}

          {/* Child Points Display */}
          {isChild && member.gamificationPoints !== undefined && (
            <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {member.gamificationPoints} points
                </span>
              </div>
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                Level {getUserLevel()}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
