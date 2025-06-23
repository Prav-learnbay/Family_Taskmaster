import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EisenhowerMatrix from "@/components/EisenhowerMatrix";
import TaskCreator from "@/components/TaskCreator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from "@shared/schema";

export default function Tasks() {
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [filterQuadrant, setFilterQuadrant] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all family tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Filter tasks based on search and quadrant
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tasks Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Family Tasks</h2>
            <p className="text-slate-600 mt-1">Organize and prioritize using the Eisenhower Matrix</p>
          </div>
          <Button onClick={() => setShowTaskCreator(true)} className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by quadrant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quadrants</SelectItem>
              <SelectItem value="1">Urgent & Important</SelectItem>
              <SelectItem value="2">Important, Not Urgent</SelectItem>
              <SelectItem value="3">Urgent, Not Important</SelectItem>
              <SelectItem value="4">Neither Urgent nor Important</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matrix">Eisenhower Matrix</TabsTrigger>
          <TabsTrigger value="list">Task List</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-6">
          <EisenhowerMatrix />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {tasks?.length === 0 ? "No tasks yet. Create your first task!" : "No tasks match your filters."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {getQuadrantName(task.quadrant)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.priority && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.dueDate && (
                          <div className="text-sm text-slate-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
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

      {/* Task Creator Modal */}
      {showTaskCreator && (
        <TaskCreator onClose={() => setShowTaskCreator(false)} />
      )}
    </div>
  );
}