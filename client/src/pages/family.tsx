import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/NavigationHeader";
import FamilyMemberCard from "@/components/FamilyMemberCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import type { User } from "@shared/schema";

export default function Family() {
  const { user } = useAuth();

  // Fetch family members
  const { data: familyMembers, isLoading: membersLoading } = useQuery<User[]>({
    queryKey: [`/api/families/${user?.familyId}/members`],
    enabled: !!user?.familyId,
  });

  // Fetch family stats
  const { data: familyStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/families/${user?.familyId}/stats`],
    enabled: !!user?.familyId,
  });

  if (membersLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const parentMembers = familyMembers?.filter(member => member.role === "parent") || [];
  const spouseMembers = familyMembers?.filter(member => member.role === "spouse") || [];
  const childMembers = familyMembers?.filter(member => member.role === "child") || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Family Management
              </h2>
              <p className="text-slate-600 mt-1">Monitor and manage your family's progress</p>
            </div>
            {user?.role === "parent" && (
              <Button className="mt-4 sm:mt-0 bg-primary text-white hover:bg-primary/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Family Member
              </Button>
            )}
          </div>

          {/* Family Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Family Members</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {familyMembers?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-600">
                    {parentMembers.length} Parent{parentMembers.length !== 1 ? 's' : ''}, {' '}
                    {spouseMembers.length} Spouse{spouseMembers.length !== 1 ? 's' : ''}, {' '}
                    {childMembers.length} Child{childMembers.length !== 1 ? 'ren' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completion Rate</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {familyStats?.completionRate || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="text-green-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={familyStats?.completionRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Active Tasks</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {(familyStats?.totalTasks || 0) - (familyStats?.completedTasks || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-orange-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-600">
                    {familyStats?.dueThisWeek || 0} due this week
                  </span>
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
                    <Trophy className="text-purple-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">+5%</span>
                  <span className="text-slate-600 ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Family Members Sections */}
        <div className="space-y-8">
          {/* Parents */}
          {parentMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Parents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parentMembers.map((member) => (
                  <FamilyMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Spouses */}
          {spouseMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Spouse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spouseMembers.map((member) => (
                  <FamilyMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Children */}
          {childMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Children</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childMembers.map((member) => (
                  <FamilyMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Family Insights */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Family Insights</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collaboration Score */}
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Task Sharing</span>
                      <span className="text-sm text-slate-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Communication</span>
                      <span className="text-sm text-slate-600">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Support Level</span>
                      <span className="text-sm text-slate-600">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Family Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Perfect Week!</p>
                      <p className="text-sm text-slate-600">100% task completion this week</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Team Player</p>
                      <p className="text-sm text-slate-600">Great collaboration this month</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Goal Achiever</p>
                      <p className="text-sm text-slate-600">Reached monthly family goals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
