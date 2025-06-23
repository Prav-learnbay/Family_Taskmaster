import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X, Target, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

interface TaskCreatorProps {
  onClose: () => void;
}

const taskFormSchema = insertTaskSchema.extend({
  dueDate: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function TaskCreator({ onClose }: TaskCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const DEMO_FAMILY_ID = "demo-family-1";

  // Fetch family members for assignment
  const { data: familyMembers } = useQuery<User[]>({
    queryKey: [`/api/families/${DEMO_FAMILY_ID}/members`],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      quadrant: 2, // Default to Important but Not Urgent
      priority: "medium",
      status: "not_started",
      points: 0,
      isRecurring: false,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate?.toISOString(),
      };
      const response = await apiRequest('POST', '/api/tasks', taskData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Created!",
        description: "New task has been added to your family's list.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const getQuadrantInfo = (quadrant: number) => {
    switch (quadrant) {
      case 1:
        return {
          name: "Urgent & Important",
          description: "Do First - Critical tasks requiring immediate attention",
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
        };
      case 2:
        return {
          name: "Important but Not Urgent",
          description: "Schedule - Important tasks for planning",
          color: "text-blue-600 bg-blue-50 border-blue-200",
          icon: <Target className="w-4 h-4 text-blue-600" />,
        };
      case 3:
        return {
          name: "Urgent but Not Important",
          description: "Delegate - Tasks that can be assigned to others",
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
          icon: <Clock className="w-4 h-4 text-yellow-600" />,
        };
      case 4:
        return {
          name: "Neither Urgent nor Important",
          description: "Eliminate - Optional or low-priority activities",
          color: "text-green-600 bg-green-50 border-green-200",
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        };
      default:
        return null;
    }
  };

  const selectedQuadrant = form.watch("quadrant");
  const quadrantInfo = getQuadrantInfo(selectedQuadrant);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            Add a new task to your family's Eisenhower Matrix for better prioritization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task title..." 
                      {...field} 
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add task details, instructions, or notes..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Eisenhower Quadrant */}
            <FormField
              control={form.control}
              name="quadrant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eisenhower Quadrant</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority quadrant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">🔴 Urgent & Important (Do First)</SelectItem>
                      <SelectItem value="2">🔵 Important, Not Urgent (Schedule)</SelectItem>
                      <SelectItem value="3">🟡 Urgent, Not Important (Delegate)</SelectItem>
                      <SelectItem value="4">🟢 Neither Urgent nor Important (Eliminate)</SelectItem>
                    </SelectContent>
                  </Select>
                  {quadrantInfo && (
                    <div className={`p-3 rounded-lg border ${quadrantInfo.color} mt-2`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {quadrantInfo.icon}
                        <span className="font-medium">{quadrantInfo.name}</span>
                      </div>
                      <p className="text-sm opacity-80">{quadrantInfo.description}</p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assign To */}
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select family member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {familyMembers?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName || member.id} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setDueDateOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Points (for gamification) */}
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points (for children)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Points awarded when task is completed (gamification for kids)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
