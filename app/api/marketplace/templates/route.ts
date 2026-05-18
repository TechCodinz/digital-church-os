import { NextResponse } from 'next/server';

const templates = [
  {
    id: 'sermon-series-pack',
    title: '4-Week Sermon Series Pack',
    category: 'Sermons',
    price: 29,
    currency: 'USD',
    description: 'A ready structure for sermon outlines, discussion questions, devotionals, and social posts.',
    status: 'starter-catalog',
  },
  {
    id: 'children-sunday-school-pack',
    title: 'Children Sunday School Pack',
    category: 'Children',
    price: 19,
    currency: 'USD',
    description: 'Age-aware lessons, memory verses, activities, and family follow-up prompts.',
    status: 'starter-catalog',
  },
  {
    id: 'worship-service-flow',
    title: 'Worship Service Flow Kit',
    category: 'Worship',
    price: 15,
    currency: 'USD',
    description: 'Worship set planning, prayer transitions, choir notes, and atmosphere prompts.',
    status: 'starter-catalog',
  },
  {
    id: 'community-aid-sunday',
    title: 'Community Aid Sunday Campaign',
    category: 'Outreach',
    price: 39,
    currency: 'USD',
    description: 'Giving, transparency, support request, and impact storytelling campaign kit.',
    status: 'starter-catalog',
  },
];

export async function GET() {
  return NextResponse.json({ templates, model: 'creator-marketplace-mvp', commissionRoadmap: 'Add creator accounts, approval workflow, checkout, payouts, reviews, and reporting.' });
}
