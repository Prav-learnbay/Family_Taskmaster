import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/NavigationHeader";
import EisenhowerMatrix from "@/components/EisenhowerMatrix";
import TaskCreator from "@/components/TaskCreator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from "@shared/schema";

export default function Tasks() {
  const { user } = useAuth();
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [filterQuadrant, setFilterQuadrant] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all family tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    enabled: !!user?.familyId,
  });

  // Filter tasks based on search and quadrant
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesQuadrant = filterQuadrant === "all" || task.quadrant.toString() === filterQuadrant;
    return matchesSearch && matchesQuadrant;
  }) || [];

  const getQuadrantName = (quadrant: number) => {
    switch (quadrant) {
      case 1: return "Urgent & Important";
      case 2: return "Important, Not Urgent";
      case 3: return "Urgent, Not Important";
      case 4: return "Neither Urgent nor Important";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "in_progress": return "text-blue-600 bg-blue-100";
      case "blocked": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tasks Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Task Management</h2>
              <p className="text-slate-600 mt-1">Organize and prioritize your family's tasks</p>
            </div>
            <Button 
              onClick={() => setShowTaskCreator(true)}
              className="mt-4 sm:mt-0 bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterQuadrant} onValueChange={setFilterQuadrant}>
              <SelectTrigger className="w-full sm:w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by quadrant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quadrants</SelectItem>
                <SelectItem value="1">Urgent & Important</SelectItem>
                <SelectItem value="2">Important, Not Urgent</SelectItem>
                <SelectItem value="3">Urgent, Not Important</SelectItem>
                <SelectItem value="4">Neither</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="matrix" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <EisenhowerMatrix />
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No tasks found matching your criteria</p>
                    {searchTerm || filterQuadrant !== "all" ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setFilterQuadrant("all");
                        }}
                        className="mt-2"
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setShowTaskCreator(true)}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Task
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <input 
                            type="checkbox" 
                            checked={task.status === "completed"}
                            className="w-4 h-4 text-primary rounded"
                            readOnly
                          />
                          <div>
                            <h4 className={`font-medium ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                {getQuadrantName(task.quadrant)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-slate-500">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.points && task.points > 0 && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {task.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Creator Modal */}
      {showTaskCreator && (
        <TaskCreator onClose={() => setShowTaskCreator(false)} />
      )}
    </div>
  );
}
