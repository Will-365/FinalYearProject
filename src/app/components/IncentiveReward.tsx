import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { 
  Gift, 
  Star, 
  Trophy, 
  TrendingUp,
  DollarSign,
  Award,
  Share2,
  Users,
  ShoppingBag,
  Ticket,
  Zap,
  Crown,
  Target,
  Calendar,
  Check,
  Sparkles,
  Mail,
  Download,
  Search
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { motion } from 'motion/react';
import { AdminIncentiveManagement } from '@/app/components/AdminIncentiveManagement';

interface IncentiveRewardProps {
  userRole?: string;
}

const userPoints = {
  total: 4850,
  available: 3250,
  pending: 600,
  lifetime: 12450,
  rank: 'Gold',
  nextRank: 'Platinum',
  pointsToNextRank: 1150,
};

const rewardCatalog = [
  { id: 0, name: 'Green Care Compost', category: 'Products', points: 400, value: '8,000 RWF', originalValue: '10,000 RWF', discount: '20% off', image: '🌱', available: true, popular: true, isGreenCare: true },
  { id: 9, name: 'Green Care Pavers', category: 'Products', points: 1200, value: '20,000 RWF', originalValue: '25,000 RWF', discount: '20% off', image: '🧱', available: true, popular: true, isGreenCare: true },
  { id: 1, name: 'MTN Mobile Credit', category: 'Airtime', points: 500, value: '5,000 RWF', image: '📱', available: true, popular: true },
  { id: 2, name: 'Fuel Voucher', category: 'Transport', points: 1000, value: '10,000 RWF', image: '⛽', available: true, popular: true },
  { id: 3, name: 'Supermarket Voucher', category: 'Shopping', points: 1500, value: '15,000 RWF', image: '🛒', available: true, popular: false },
  { id: 4, name: 'Restaurant Meal Voucher', category: 'Food', points: 800, value: '8,000 RWF', image: '🍽️', available: true, popular: true },
  { id: 5, name: 'Electricity Tokens', category: 'Utilities', points: 1200, value: '12,000 RWF', image: '💡', available: true, popular: false },
  { id: 6, name: 'Eco-Friendly Bag Set', category: 'Products', points: 600, value: 'Worth 6,000 RWF', image: '♻️', available: true, popular: false },
  { id: 7, name: 'Tree Planting Certificate', category: 'Environmental', points: 300, value: '3 Trees Planted', image: '🌳', available: true, popular: false },
  { id: 8, name: 'Cinema Tickets (2x)', category: 'Entertainment', points: 1000, value: '10,000 RWF', image: '🎬', available: false, popular: false },
];

const achievements = [
  { id: 1, name: 'Early Adopter', description: 'Joined in the first month', icon: '🚀', unlocked: true, points: 500, date: '2025-11-15' },
  { id: 2, name: 'Recycling Champion', description: 'Recycled 100kg of waste', icon: '♻️', unlocked: true, points: 1000, date: '2025-12-20' },
  { id: 3, name: 'Community Leader', description: 'Referred 10 new users', icon: '👥', unlocked: true, points: 750, date: '2026-01-05' },
  { id: 4, name: 'Perfect Month', description: 'Never missed a collection', icon: '⭐', unlocked: true, points: 500, date: '2026-01-01' },
  { id: 5, name: 'Green Warrior', description: 'Complete 50 recycling tasks', icon: '🌿', unlocked: false, progress: 35, total: 50 },
  { id: 6, name: 'Platinum Member', description: 'Reach Platinum tier', icon: '💎', unlocked: false, progress: 4850, total: 6000 },
];

const referrals = [
  { id: 1, name: 'Jean Mutabazi', status: 'Active', pointsEarned: 500, joinDate: '2026-01-10' },
  { id: 2, name: 'Marie Uwase', status: 'Active', pointsEarned: 500, joinDate: '2026-01-08' },
  { id: 3, name: 'Patrick Nkusi', status: 'Pending', pointsEarned: 0, joinDate: '2026-01-18' },
  { id: 4, name: 'Grace Murekatete', status: 'Active', pointsEarned: 500, joinDate: '2025-12-28' },
];

const transactions = [
  { id: 1, type: 'earned', description: 'Weekly recycling completed', points: 250, date: '2026-01-20' },
  { id: 2, type: 'redeemed', description: 'MTN Mobile Credit', points: -500, date: '2026-01-19' },
  { id: 3, type: 'earned', description: 'Referral bonus - Marie Uwase', points: 500, date: '2026-01-18' },
  { id: 4, type: 'earned', description: 'Perfect Month achievement', points: 500, date: '2026-01-17' },
  { id: 5, type: 'redeemed', description: 'Fuel Voucher', points: -1000, date: '2026-01-15' },
  { id: 6, type: 'earned', description: 'Community event participation', points: 300, date: '2026-01-12' },
  { id: 7, type: 'earned', description: 'Weekly collection completed', points: 200, date: '2026-01-10' },
];

export function IncentiveReward({ userRole }: IncentiveRewardProps) {
  // If admin, show admin view
  if (userRole === 'admin') {
    return <AdminIncentiveManagement />;
  }

  // Otherwise, show resident view
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);

  const filteredRewards = rewardCatalog.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && reward.available;
  });

  const handleRedeem = (reward: any) => {
    setSelectedReward(reward);
    setRedeemDialogOpen(true);
  };

  const confirmRedeem = () => {
    // Simulate achievement unlock
    setRedeemDialogOpen(false);
    setTimeout(() => {
      setAchievementUnlocked(true);
      setTimeout(() => setAchievementUnlocked(false), 3000);
    }, 500);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Platinum':
        return 'from-gray-400 to-gray-600';
      case 'Gold':
        return 'from-yellow-400 to-yellow-600';
      case 'Silver':
        return 'from-gray-300 to-gray-400';
      default:
        return 'from-green-400 to-green-600';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Achievement Unlock Animation */}
      {achievementUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="bg-white rounded-2xl p-8 shadow-2xl text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="font-bold text-2xl mb-2">Reward Redeemed!</h3>
            <p className="text-gray-600">Your voucher has been sent to your email</p>
          </motion.div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Incentive & Reward System</h2>
          <p className="text-gray-600 mt-1">Earn points and redeem exciting rewards</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          My Rewards Statement
        </Button>
      </div>

      {/* Points Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Points Balance</CardTitle>
                <CardDescription>Available to spend</CardDescription>
              </div>
              <Crown className={`h-8 w-8 bg-gradient-to-br ${getRankColor(userPoints.rank)} bg-clip-text text-transparent`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-bold text-4xl text-green-600">{userPoints.available.toLocaleString()}</div>
                <p className="text-sm text-gray-600 mt-1">
                  +{userPoints.pending} pending • {userPoints.lifetime.toLocaleString()} lifetime points
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`bg-gradient-to-r ${getRankColor(userPoints.rank)} text-white border-0`}>
                  {userPoints.rank} Member
                </Badge>
                <span className="text-sm text-gray-600">
                  {userPoints.pointsToNextRank} points to {userPoints.nextRank}
                </span>
              </div>
              <div>
                <Progress value={(userPoints.total / 6000) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
            <p className="text-xs text-gray-600 mt-1">unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{referrals.filter(r => r.status === 'Active').length}</div>
            <p className="text-xs text-gray-600 mt-1">active referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="rewards">Reward Catalog</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="referrals">Referral Program</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="statement">Monthly Statement</TabsTrigger>
        </TabsList>

        {/* Reward Catalog Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reward Catalog</CardTitle>
                  <CardDescription>Browse and redeem exciting rewards</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search rewards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Airtime">Airtime</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Products">Products</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRewards.map((reward) => (
                  <Card key={reward.id} className={`hover:shadow-lg transition-shadow ${reward.isGreenCare ? 'border-2 border-green-500' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-4xl mb-2">{reward.image}</div>
                        <div className="flex flex-col gap-1">
                          {reward.isGreenCare && (
                            <Badge className="bg-green-600 text-white">
                              Green Care
                            </Badge>
                          )}
                          {reward.popular && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      {reward.isGreenCare ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-through">{reward.originalValue}</span>
                            <Badge className="bg-red-100 text-red-800 text-xs">{reward.discount}</Badge>
                          </div>
                          <CardDescription className="font-semibold text-green-600">{reward.value}</CardDescription>
                          <p className="text-xs text-gray-600">Special discount with your reward points!</p>
                        </div>
                      ) : (
                        <CardDescription>{reward.value}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{reward.category}</Badge>
                          <div className="flex items-center gap-1 font-bold text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {reward.points}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRedeem(reward)}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={userPoints.available < reward.points}
                        >
                          {userPoints.available >= reward.points ? (
                            <>
                              <Gift className="h-4 w-4 mr-2" />
                              Redeem Now
                            </>
                          ) : (
                            'Insufficient Points'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Milestones</CardTitle>
              <CardDescription>Unlock achievements to earn bonus points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-4 ${
                      achievement.unlocked ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          {achievement.unlocked && (
                            <Badge className="bg-green-600 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.unlocked ? (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <Sparkles className="h-4 w-4" />
                              +{achievement.points} points
                            </div>
                            <span className="text-gray-500">• {achievement.date}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Progress value={(achievement.progress! / achievement.total!) * 100} />
                            <p className="text-xs text-gray-600">
                              {achievement.progress}/{achievement.total}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral Program Tab */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Referral Program</CardTitle>
                  <CardDescription>Invite friends and earn 500 points per referral</CardDescription>
                </div>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Referral Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Your Referral Link</DialogTitle>
                      <DialogDescription>Invite friends to join Green Care Rwanda</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Your Referral Code</Label>
                        <div className="flex gap-2">
                          <Input value="GCR-MUTABAZI-2026" readOnly className="font-mono" />
                          <Button variant="outline">Copy</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Referral Link</Label>
                        <div className="flex gap-2">
                          <Input value="https://greencare.rw/ref/mutabazi" readOnly className="text-sm" />
                          <Button variant="outline">Copy</Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Mail className="h-4 w-4 mr-2" />
                          Share via Email
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share on Social
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="h-10 w-10 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Earn 500 Points Per Referral</h4>
                    <p className="text-sm text-green-800">Get rewards when your friends complete their first collection</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Your Referrals ({referrals.length})</h4>
                {referrals.map((referral) => (
                  <div key={referral.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">{referral.name}</h5>
                          <p className="text-sm text-gray-600">Joined {referral.joinDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={referral.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {referral.status}
                        </Badge>
                        {referral.pointsEarned > 0 && (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign className="h-4 w-4" />
                            +{referral.pointsEarned}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your complete points activity</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'earned' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <Gift className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Statement Tab */}
        <TabsContent value="statement" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Statement</CardTitle>
                  <CardDescription>January 2026 Points Summary</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Points Earned</h4>
                    </div>
                    <div className="font-bold text-2xl text-green-600">+1,750</div>
                    <p className="text-sm text-gray-600 mt-1">This month</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-red-600" />
                      <h4 className="font-medium">Points Redeemed</h4>
                    </div>
                    <div className="font-bold text-2xl text-red-600">-1,500</div>
                    <p className="text-sm text-gray-600 mt-1">This month</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Net Balance</h4>
                    </div>
                    <div className="font-bold text-2xl text-blue-600">+250</div>
                    <p className="text-sm text-gray-600 mt-1">Net change</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Earning Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Weekly Collections</span>
                      <span className="font-medium">+800 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Referral Bonuses</span>
                      <span className="font-medium">+500 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Achievement Unlocks</span>
                      <span className="font-medium">+300 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Community Events</span>
                      <span className="font-medium">+150 points</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Redemption History</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">MTN Mobile Credit</span>
                      <span className="font-medium text-red-600">-500 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fuel Voucher</span>
                      <span className="font-medium text-red-600">-1,000 points</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Redeem Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>Review your reward details before redeeming</DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl">{selectedReward.image}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedReward.name}</h4>
                  {selectedReward.isGreenCare ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 line-through">{selectedReward.originalValue}</span>
                        <Badge className="bg-red-100 text-red-800 text-xs">{selectedReward.discount}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-green-600">{selectedReward.value}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{selectedReward.value}</p>
                  )}
                </div>
              </div>
              {selectedReward.isGreenCare && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    🎉 You're getting a special discount on this Green Care product! Enjoy {selectedReward.discount} because you're using your reward points.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reward Cost</span>
                  <span className="font-medium">{selectedReward.points} points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Balance</span>
                  <span className="font-medium">{userPoints.available} points</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Balance After</span>
                  <span className="font-bold text-green-600">
                    {userPoints.available - selectedReward.points} points
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRedeemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={confirmRedeem}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Redemption
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}