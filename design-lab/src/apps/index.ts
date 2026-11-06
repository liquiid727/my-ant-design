import type { ComponentType } from 'react';
import { HomeScreen, PostcardScreen, RideEndScreen } from './ride/screens';
import { LedgerBudgetScreen, LedgerMonthScreen } from './ledger/screens';

export type ScreenEntry = {
  id: string;
  label: string;
  component: ComponentType;
};

export const SCREENS: Record<string, ScreenEntry[]> = {
  ride: [
    { id: 'discover', label: '发现', component: HomeScreen },
    { id: 'ride-end', label: '骑行结束', component: RideEndScreen },
    { id: 'postcard', label: '明信片', component: PostcardScreen },
  ],
  ledger: [
    { id: 'month', label: '本月', component: LedgerMonthScreen },
    { id: 'budget', label: '预算', component: LedgerBudgetScreen },
  ],
};

export const screensOf = (appId: string): ScreenEntry[] => SCREENS[appId] ?? SCREENS.ride;
