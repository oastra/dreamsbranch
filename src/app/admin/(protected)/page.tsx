import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { formatCurrency } from '@/lib/utils';
import { Heart, Calendar, Newspaper, DollarSign, Inbox, FileEdit } from 'lucide-react';

async function getStats() {
  const [activeCampaigns, totalDonations, activeEvents, publishedArticles, unreadContacts, draftCount] = await Promise.all([
    db.campaign.count({ where: { status: 'ACTIVE' } }),
    db.donation.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    db.event.count({ where: { status: 'ACTIVE' } }),
    db.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    db.contactSubmission.count({ where: { isRead: false } }),
    db.campaign.count({ where: { status: 'DRAFT' } }),
  ]);
  return {
    activeCampaigns,
    totalRaised: totalDonations._sum.amount?.toNumber() || 0,
    activeEvents,
    publishedArticles,
    unreadContacts,
    draftCount,
  };
}

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const stats = await getStats();

  const cards = [
    { label: 'Total Raised', value: formatCurrency(stats.totalRaised), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Heart, color: 'text-brand-blue bg-brand-blue-light' },
    { label: 'Active Events', value: stats.activeEvents, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
    { label: 'Published Articles', value: stats.publishedArticles, icon: Newspaper, color: 'text-amber-600 bg-amber-50' },
    { label: 'Unread Messages', value: stats.unreadContacts, icon: Inbox, color: 'text-red-600 bg-red-50' },
    { label: 'Drafts', value: stats.draftCount, icon: FileEdit, color: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2">Dashboard</h1>
        <p className="text-text-secondary text-body">Welcome back, {user.name}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-h3">{card.value}</p>
                  <p className="text-body-sm text-text-secondary">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
