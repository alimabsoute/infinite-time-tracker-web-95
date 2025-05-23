
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import Header from "../components/Header";
import AuthHeader from "../components/AuthHeader";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard, Shield, User } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, subscriptionEnd, createCheckoutSession } = useSubscription();

  const handleSubscribe = async () => {
    const url = await createCheckoutSession();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthHeader />
      
      <motion.div 
        className="container mx-auto px-4 py-8 max-w-5xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1 
          className="text-2xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Profile Settings
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{subscriptionTier} Plan</p>
                      {subscribed && (
                        <span className="bg-primary/20 text-primary text-xs py-0.5 px-2 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {subscribed && subscriptionEnd && (
                    <div>
                      <p className="text-sm text-muted-foreground">Renews On</p>
                      <p className="font-medium">{formatDate(subscriptionEnd)}</p>
                    </div>
                  )}
                  
                  {!subscribed && (
                    <Button 
                      onClick={handleSubscribe} 
                      className="w-full mt-4"
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="account">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User size={16} />
                  <span>Account</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>Billing</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium">Display Name</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Enter display name"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Timezone</label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-md">
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>America/New_York (Eastern Time)</option>
                          <option>America/Chicago (Central Time)</option>
                          <option>America/Denver (Mountain Time)</option>
                          <option>America/Los_Angeles (Pacific Time)</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => toast.success("Settings saved")} 
                      className="w-full"
                    >
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="border p-4 rounded-md flex flex-col">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold capitalize">{subscriptionTier} Plan</h3>
                            {subscribed ? (
                              <p className="text-sm text-muted-foreground">
                                Renews on {formatDate(subscriptionEnd)}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Free tier with limited features
                              </p>
                            )}
                          </div>
                          
                          <div>
                            {subscribed ? (
                              <Button variant="outline">
                                Manage Subscription
                              </Button>
                            ) : (
                              <Button onClick={handleSubscribe}>
                                Upgrade
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium">Current Password</label>
                        <input 
                          type="password" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Enter current password"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">New Password</label>
                        <input 
                          type="password" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <input 
                          type="password" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => toast.success("Password updated")} 
                      className="w-full"
                    >
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
