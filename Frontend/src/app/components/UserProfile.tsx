import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Progress } from '@/app/components/ui/progress';
import { User, Mail, Phone, MapPin, Bell, Shield, Award, Calendar, TrendingUp, CheckCircle2, Star, Truck } from 'lucide-react';

interface UserProfileProps {
  userRole?: string;
}

export function UserProfile({ userRole }: UserProfileProps) {
  const [notifications, setNotifications] = useState({
    collections: true,
    rewards: true,
    news: false,
  });

  // Collector profile data
  if (userRole === 'collector') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h2 className="font-bold text-2xl">My Profile</h2>
          <p className="text-gray-600 mt-1">View your performance and manage settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-green-600 text-white text-2xl">
                      JB
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl">Jean Baptiste</h3>
                  <p className="text-gray-600 text-sm">+250 788 123 000</p>
                  <p className="text-gray-600 text-sm">jean.baptiste@greencare.rw</p>
                  <Badge className="mt-3 bg-green-100 text-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    Top Performer
                  </Badge>
                  <div className="flex gap-2 mt-4 w-full">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Employee ID</span>
                    <span className="font-medium">COL-2024-018</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium">March 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Assigned Zone</span>
                    <span className="font-medium">Gasabo - Remera</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pickups Completed</span>
                  <span className="font-bold text-lg text-green-600">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Weight</span>
                  <span className="font-bold text-lg">3,450 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">On-Time Rate</span>
                  <span className="font-bold text-lg text-green-600">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Earnings</span>
                  <span className="font-bold text-lg text-green-600">RWF 185,000</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Bell className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Your collection statistics and achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                        </div>
                        <div className="font-bold text-2xl text-green-600">98.5%</div>
                        <Progress value={98.5} className="mt-2 h-2" />
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">Total Pickups</span>
                        </div>
                        <div className="font-bold text-2xl text-blue-600">1,847</div>
                        <p className="text-xs text-gray-600 mt-1">Lifetime total</p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-600">Performance Score</span>
                        </div>
                        <div className="font-bold text-2xl text-purple-600">9.4/10</div>
                        <Progress value={94} className="mt-2 h-2" />
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-600">Customer Rating</span>
                        </div>
                        <div className="font-bold text-2xl text-yellow-600">4.8/5.0</div>
                        <p className="text-xs text-gray-600 mt-1">Based on 234 reviews</p>
                      </div>
                    </div>

                    {/* Recent Achievements */}
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Recent Achievements</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Perfect Week</p>
                            <p className="text-xs text-gray-600">Completed all pickups on time</p>
                          </div>
                          <span className="text-xs text-gray-500">March 2026</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">100 Pickups Milestone</p>
                            <p className="text-xs text-gray-600">Reached monthly target</p>
                          </div>
                          <span className="text-xs text-gray-500">February 2026</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Star className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Top Rated Collector</p>
                            <p className="text-xs text-gray-600">Highest customer satisfaction</p>
                          </div>
                          <span className="text-xs text-gray-500">January 2026</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstname">First Name</Label>
                        <Input id="firstname" defaultValue="Jean" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastname">Last Name</Label>
                        <Input id="lastname" defaultValue="Baptiste" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2">
                        <Mail className="h-5 w-5 text-gray-400 mt-2.5" />
                        <Input id="email" type="email" defaultValue="jean.baptiste@greencare.rw" className="flex-1" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Phone className="h-5 w-5 text-gray-400 mt-2.5" />
                        <Input id="phone" defaultValue="+250 788 123 000" className="flex-1" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Home Address</Label>
                      <div className="flex gap-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-2.5" />
                        <Input id="address" defaultValue="Gasabo, Remera, Rukiri I" className="flex-1" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="national-id">National ID</Label>
                      <Input id="national-id" defaultValue="1198780123456789" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency">Emergency Contact</Label>
                      <Input id="emergency" defaultValue="+250 788 999 888" />
                    </div>

                    <div className="pt-4">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Task Assignments</p>
                          <p className="text-sm text-gray-600">Get notified when new pickups are assigned</p>
                        </div>
                        <Switch
                          checked={notifications.collections}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, collections: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Route Changes</p>
                          <p className="text-sm text-gray-600">Alert when your route is updated</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Earnings Updates</p>
                          <p className="text-sm text-gray-600">Notifications about bonuses and payments</p>
                        </div>
                        <Switch
                          checked={notifications.rewards}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, rewards: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Admin Messages</p>
                          <p className="text-sm text-gray-600">Important messages from management</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Performance Reports</p>
                          <p className="text-sm text-gray-600">Weekly and monthly performance summaries</p>
                        </div>
                        <Switch
                          checked={notifications.news}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, news: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Security</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Phone className="h-4 w-4 mr-2" />
                          Update Phone Number
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Default resident/admin profile
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">My Profile</h2>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-green-600 text-white text-2xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-xl">John Doe</h3>
                <p className="text-gray-600 text-sm">johndoe@email.com</p>
                <Badge className="mt-3 bg-green-100 text-green-800">
                  <Award className="h-3 w-3 mr-1" />
                  Bronze Member
                </Badge>
                <div className="flex gap-2 mt-4 w-full">
                  <Button variant="outline" size="sm" className="flex-1">
                    Change Photo
                  </Button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Jan 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-medium text-green-600">242</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Collections</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recycled</span>
                  <span className="font-medium">45.6 kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <Input id="firstname" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <Input id="lastname" defaultValue="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                      <Mail className="h-5 w-5 text-gray-400 mt-2.5" />
                      <Input id="email" type="email" defaultValue="johndoe@email.com" className="flex-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Phone className="h-5 w-5 text-gray-400 mt-2.5" />
                      <Input id="phone" defaultValue="+250 788 123 456" className="flex-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-2.5" />
                      <Input id="address" defaultValue="Kigali, Rwanda" className="flex-1" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Collection Reminders</p>
                        <p className="text-sm text-gray-600">Get notified before scheduled pickups</p>
                      </div>
                      <Switch
                        checked={notifications.collections}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, collections: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Rewards & Points</p>
                        <p className="text-sm text-gray-600">Updates about earned points and rewards</p>
                      </div>
                      <Switch
                        checked={notifications.rewards}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, rewards: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">News & Updates</p>
                        <p className="text-sm text-gray-600">Platform updates and announcements</p>
                      </div>
                      <Switch
                        checked={notifications.news}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, news: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
