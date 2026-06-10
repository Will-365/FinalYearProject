import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  ThumbsUp, 
  Share2, 
  MapPin,
  UserPlus,
  Award,
  MessageCircle,
  Heart,
  Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  type: 'cleanup' | 'workshop' | 'awareness';
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  category: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Nyamirambo Clean-Up Drive',
    date: '2026-01-25',
    time: '8:00 AM - 12:00 PM',
    location: 'Nyamirambo Market Area',
    participants: 45,
    maxParticipants: 60,
    type: 'cleanup',
  },
  {
    id: '2',
    title: 'Composting Workshop',
    date: '2026-01-28',
    time: '2:00 PM - 4:00 PM',
    location: 'Green Care Training Center',
    participants: 18,
    maxParticipants: 30,
    type: 'workshop',
  },
  {
    id: '3',
    title: 'World Recycling Day Celebration',
    date: '2026-02-01',
    time: '9:00 AM - 5:00 PM',
    location: 'Kigali Convention Centre',
    participants: 120,
    maxParticipants: 200,
    type: 'awareness',
  },
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Marie Claire N.',
    avatar: 'MC',
    content: 'Just reached 1000 points! 🎉 Recycling is not just good for the planet, it\'s rewarding too. Let\'s keep our Kigali clean!',
    timestamp: '2 hours ago',
    likes: 45,
    comments: 8,
    category: 'achievement',
  },
  {
    id: '2',
    author: 'Jean Paul K.',
    avatar: 'JP',
    content: 'Quick tip: Rinse your plastic bottles before recycling. It makes the processing much easier and more efficient! 💧♻️',
    timestamp: '5 hours ago',
    likes: 32,
    comments: 5,
    category: 'tip',
  },
  {
    id: '3',
    author: 'Sarah W.',
    avatar: 'SW',
    content: 'Looking forward to the Nyamirambo clean-up this Saturday! Who else is joining? Let\'s make a difference together! 🌍',
    timestamp: '1 day ago',
    likes: 67,
    comments: 15,
    category: 'event',
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first recycling activity',
    icon: '🌱',
    earned: true,
  },
  {
    id: '2',
    name: 'Eco Warrior',
    description: 'Recycle 50kg of materials',
    icon: '⚔️',
    earned: true,
  },
  {
    id: '3',
    name: 'Community Champion',
    description: 'Participate in 5 community events',
    icon: '👑',
    earned: false,
    progress: 60,
  },
  {
    id: '4',
    name: 'Perfect Week',
    description: 'Complete all scheduled collections in a week',
    icon: '✨',
    earned: true,
  },
  {
    id: '5',
    name: 'Green Influencer',
    description: 'Get 100 likes on your posts',
    icon: '📢',
    earned: false,
    progress: 45,
  },
  {
    id: '6',
    name: 'Sustainability Master',
    description: 'Achieve 80% recycling rate for 3 months',
    icon: '🏆',
    earned: false,
    progress: 33,
  },
];

const educationalContent = [
  {
    id: '1',
    title: 'Why Recycling Matters for Rwanda',
    type: 'article',
    duration: '5 min read',
    image: '📚',
    category: 'Education',
  },
  {
    id: '2',
    title: 'How to Start Composting at Home',
    type: 'video',
    duration: '8 min',
    image: '🎥',
    category: 'Tutorial',
  },
  {
    id: '3',
    title: 'Plastic-Free Living: A Beginner\'s Guide',
    type: 'article',
    duration: '7 min read',
    image: '📖',
    category: 'Lifestyle',
  },
  {
    id: '4',
    title: 'Understanding Rwanda\'s Ban on Single-Use Plastics',
    type: 'video',
    duration: '6 min',
    image: '🎬',
    category: 'Policy',
  },
];

export function CommunityEngagement() {
  const [selectedTab, setSelectedTab] = useState('feed');

  const getEventTypeBadge = (type: string) => {
    const variants = {
      cleanup: 'bg-blue-100 text-blue-800',
      workshop: 'bg-purple-100 text-purple-800',
      awareness: 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Community Engagement</h2>
          <p className="text-gray-600 mt-1">Connect, learn, and make an impact together</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share with Community</DialogTitle>
              <DialogDescription>
                Share your achievements, tips, or questions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Achievement</option>
                  <option>Tip</option>
                  <option>Question</option>
                  <option>Event</option>
                  <option>General</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>What's on your mind?</Label>
                <Textarea placeholder="Share your thoughts..." rows={4} />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                Post to Community
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">3,245</div>
            <p className="text-gray-600 text-sm">In your district</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">12</div>
            <p className="text-gray-600 text-sm">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Badges</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">4/10</div>
            <p className="text-gray-600 text-sm">Achievements earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Community Rank</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">#23</div>
            <p className="text-gray-600 text-sm">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="feed">
            <MessageSquare className="h-4 w-4 mr-2" />
            Community Feed
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="learn">
            <BookOpen className="h-4 w-4 mr-2" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Award className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {mockPosts.map((post) => (
                  <div key={post.id} className="pb-6 border-b last:border-0">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-green-600 text-white">
                          {post.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{post.author}</div>
                            <div className="text-sm text-gray-600">{post.timestamp}</div>
                          </div>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        <div className="flex items-center gap-6">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>Help us improve our services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Feedback Type</Label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>General Feedback</option>
                    <option>Service Issue</option>
                    <option>Feature Request</option>
                    <option>Suggestion</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Your Message</Label>
                  <Textarea placeholder="Share your thoughts..." rows={3} />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Community Events</CardTitle>
              <CardDescription>Join local environmental activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-lg mb-1">{event.title}</div>
                        {getEventTypeBadge(event.type)}
                      </div>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {event.date} • {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.participants}/{event.maxParticipants} participants
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Event
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volunteer Opportunities</CardTitle>
              <CardDescription>Make a lasting impact in your community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Collection Route Assistant</div>
                  <p className="text-sm text-gray-600 mb-3">
                    Help collectors on their daily routes and educate residents about proper waste sorting.
                  </p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Community Educator</div>
                  <p className="text-sm text-gray-600 mb-3">
                    Lead workshops and training sessions on recycling and environmental conservation.
                  </p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Educational Resources</CardTitle>
              <CardDescription>Learn more about sustainable waste management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educationalContent.map((content) => (
                  <div key={content.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-4xl mb-3">{content.image}</div>
                    <Badge className="mb-2">{content.category}</Badge>
                    <div className="font-medium mb-2">{content.title}</div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{content.type}</span>
                      <span>{content.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Daily sustainability tips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <div className="font-medium mb-1">Did you know?</div>
                      <p className="text-sm text-gray-700">
                        Recycling one aluminum can saves enough energy to power a TV for 3 hours!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌍</div>
                    <div>
                      <div className="font-medium mb-1">Today's Challenge</div>
                      <p className="text-sm text-gray-700">
                        Avoid single-use plastics today. Bring your reusable bags when shopping!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Track your environmental impact milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 border rounded-lg ${
                      achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-4xl ${!achievement.earned && 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">{achievement.name}</div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.earned ? (
                          <Badge className="bg-green-600">Earned ✓</Badge>
                        ) : achievement.progress ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline">Locked</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Leaderboard</CardTitle>
              <CardDescription>Top contributors this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Jean Paul K.', points: 1250, recycled: '85.5 kg', badge: '🥇' },
                  { rank: 2, name: 'Marie Claire N.', points: 1180, recycled: '78.2 kg', badge: '🥈' },
                  { rank: 3, name: 'David M.', points: 1050, recycled: '72.8 kg', badge: '🥉' },
                  { rank: 4, name: 'Sarah W.', points: 980, recycled: '65.4 kg', badge: '⭐' },
                  { rank: 5, name: 'Patrick R.', points: 920, recycled: '61.2 kg', badge: '⭐' },
                  { rank: 23, name: 'You', points: 242, recycled: '21.2 kg', badge: '👤' },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      user.name === 'You' ? 'bg-green-50 border-green-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-2xl font-bold ${
                          user.rank <= 3 ? 'text-yellow-600' : 'text-gray-600'
                        }`}
                      >
                        {user.badge}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.name}
                          {user.name === 'You' && (
                            <Badge className="ml-2 bg-green-600">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.points} points • {user.recycled} recycled
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-600">#{user.rank}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
