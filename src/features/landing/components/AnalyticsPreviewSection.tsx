
import { motion } from "framer-motion";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { TrendingUp, Clock, Target, Activity } from "lucide-react";

const AnalyticsPreviewSection = () => {
  // Sample data for the preview
  const weeklyData = [
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: 8.2 },
    { day: 'Wed', hours: 7.1 },
    { day: 'Thu', hours: 9.0 },
    { day: 'Fri', hours: 7.8 },
    { day: 'Sat', hours: 4.2 },
    { day: 'Sun', hours: 3.5 }
  ];

  const categoryData = [
    { name: 'Development', value: 45, color: '#6366f1' },
    { name: 'Meetings', value: 25, color: '#8b5cf6' },
    { name: 'Research', value: 20, color: '#ec4899' },
    { name: 'Design', value: 10, color: '#f59e0b' }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/10"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-accent/10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Analytics at Your Fingertips
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your productivity patterns, identify peak performance hours, and optimize your workflow with detailed insights and beautiful visualizations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Analytics Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/80 backdrop-blur-sm border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Time</p>
                      <p className="text-xl font-bold">46.3h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peak Hour</p>
                      <p className="text-xl font-bold">2 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Chart */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="h-32 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1 ml-6">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <span className="font-medium">{category.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-full mt-1">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Visual Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Beautiful charts and graphs that make it easy to understand your productivity patterns and time allocation across different projects.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/20 p-3 rounded-full mt-1">
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Goal Achievement</h3>
                  <p className="text-muted-foreground">
                    Set daily and weekly time goals, track your progress, and celebrate achievements with our intelligent goal tracking system.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-3 rounded-full mt-1">
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Performance Insights</h3>
                  <p className="text-muted-foreground">
                    Discover your peak productivity hours, identify trends, and get personalized recommendations to optimize your workflow.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/20"
              >
                <h4 className="font-semibold text-lg mb-2">Pro Analytics Features</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Advanced reporting, custom dashboards, and team collaboration tools available with PhynxTimer Pro.
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>Upgrade for unlimited insights</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsPreviewSection;
