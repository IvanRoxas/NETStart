import React from 'react';
import { getShopItems } from '@/app/admin/actions/shop';
import ShopClientWrapper from './ShopClientWrapper';

export default async function AdminShopPage() {
  const initialItems = await getShopItems();

  return <ShopClientWrapper initialItems={initialItems} />;
}
