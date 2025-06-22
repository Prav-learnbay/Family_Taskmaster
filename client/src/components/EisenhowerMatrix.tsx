import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, Phone } from "lucide-react";
import { useState } from "react";
import type { Task } from "@shared/schema";

export default function EisenhowerMatrix() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState("all");

  // Fetch tasks for each quadrant
  const { data: quadrant1Tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { quadrant: 1 }],
    enabled: !!user?.familyId,
  });

  const { data: quadrant2Tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks?quadrant=2'],
    enabled: !!user?.familyId,
  });

  const { data: quadrant3Tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks?quadrant=3'],
    enabled: !!user?.familyId,
  });

  const { data: quadrant4Tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks?quadrant=4'],
    enabled: !!user?.familyId,
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest('POST', `/api/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Completed!",
        description: "Great job! Task marked as complete.",
      });
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTaskComplete = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const getTaskIcon = (quadrant: number) => {
    switch (quadrant) {
      case 1: return <AlertTriangle className="text-red-500 text-sm" />;
      case 2: return <Clock className="text-blue-500 text-sm" />;
      case 3: return <Phone className="text-yellow-500 text-sm" />;
      case 4: return <CheckCircle className="text-green-500 text-sm" />;
      default: return null;
    }
  };

  const TaskItem = ({ task, quadrant }: { task: Task; quadrant: number }) => {
    const isCompleted = task.status === "completed";
    const quadrantClass = `task-item-${
      quadrant === 1 ? 'urgent-important' :
      quadrant === 2 ? 'important-not-urgent' :
      quadrant === 3 ? 'urgent-not-important' :
      'neither'
    }`;

    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${quadrantClass}`}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => !isCompleted && handleTaskComplete(task.id)}
          className="w-4 h-4 text-primary rounded"
          disabled={isCompleted || completeTaskMutation.isPending}
        />
        <div className="flex-1">
          <p className={`text-sm font-medium text-slate-900 ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </p>
          {task.dueDate && (
            <p className="text-xs text-slate-600">
              Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
          {task.assigneeId && (
            <p className="text-xs text-slate-600">
              Assigned to: {task.assigneeId === user?.id ? 'Me' : 'Family Member'}
            </p>
          )}
        </div>
        {getTaskIcon(quadrant)}
        {task.points && task.points > 0 && (
          <Badge variant="secondary" className="text-xs">
            {task.points} pts
          </Badge>
        )}
      </div>
    );
  };

  const QuadrantCard = ({ 
    title, 
    subtitle, 
    tasks, 
    quadrant, 
    colorClass 
  }: { 
    title: string; 
    subtitle: string; 
    tasks: Task[]; 
    quadrant: number;
    colorClass: string;
  }) => (
    <Card className={`${colorClass} min-h-[300px]`}>
      <CardHeader className={`quadrant-header px-6 py-4 border-b rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${
              quadrant === 1 ? 'bg-red-500' :
              quadrant === 2 ? 'bg-blue-500' :
              quadrant === 3 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>
            <CardTitle className={`font-semibold ${
              quadrant === 1 ? 'text-red-900' :
              quadrant === 2 ? 'text-blue-900' :
              quadrant === 3 ? 'text-yellow-900' :
              'text-green-900'
            }`}>
              {title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className={`text-sm ${
            quadrant === 1 ? 'bg-red-100 text-red-600' :
            quadrant === 2 ? 'bg-blue-100 text-blue-600' :
            quadrant === 3 ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {tasks.length} tasks
          </Badge>
        </div>
        <p className={`text-sm mt-1 ${
          quadrant === 1 ? 'text-red-700' :
          quadrant === 2 ? 'text-blue-700' :
          quadrant === 3 ? 'text-yellow-700' :
          'text-green-700'
        }`}>
          {subtitle}
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No tasks in this quadrant</p>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} quadrant={quadrant} />
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Eisenhower Matrix</h3>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Family</SelectItem>
            <SelectItem value="me">My Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuadrantCard
          title="Urgent & Important"
          subtitle="Do First"
          tasks={quadrant1Tasks}
          quadrant={1}
          colorClass="quadrant-urgent-important"
        />
        
        <QuadrantCard
          title="Important but Not Urgent"
          subtitle="Schedule"
          tasks={quadrant2Tasks}
          quadrant={2}
          colorClass="quadrant-important-not-urgent"
        />
        
        <QuadrantCard
          title="Urgent but Not Important"
          subtitle="Delegate"
          tasks={quadrant3Tasks}
          quadrant={3}
          colorClass="quadrant-urgent-not-important"
        />
        
        <QuadrantCard
          title="Neither Urgent nor Important"
          subtitle="Eliminate"
          tasks={quadrant4Tasks}
          quadrant={4}
          colorClass="quadrant-neither"
        />
      </div>
    </div>
  );
}
