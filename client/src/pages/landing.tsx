import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeIcon, Users, Calendar, Target, Star, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">FamilySync</h1>
            </div>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Enter App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Smart Family Task Management
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Coordinate your family's daily tasks, appointments, and goals using the proven Eisenhower Matrix system. 
            Built for parents, spouses, and children with age-appropriate interfaces and gamification.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Eisenhower Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Prioritize tasks using the proven urgent/important framework. Visual quadrants help your family focus on what matters most.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Multi-User Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Parent admin controls, spouse collaboration, and child-friendly interfaces with gamification elements and rewards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Smart Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Color-coded events for work, school, health, and family activities. Conflict detection and automatic scheduling suggestions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Family Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Track completion rates, collaboration scores, and family productivity trends with beautiful visual charts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Child Safety</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                COPPA compliant with parental oversight features, safe gamification, and age-appropriate task management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <HomeIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Real-time Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                All family members stay synchronized across devices with instant updates, notifications, and collaborative features.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Family Organization?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Join thousands of families who have reduced scheduling conflicts by 80% and increased task completion by 25% with FamilySync.
          </p>
          <Link href="/">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
            >
              Get Started - It's Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
