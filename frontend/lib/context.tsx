'use client';

// lib/context.tsx
// Global state management via React Context + useReducer

import React, { createContext, useContext, useReducer } from 'react';
import type { NewsArticle, MarketData, SocialPost, ParsedArticle } from './types';
import { mockNews, mockMarkets, mockSocial } from './mocks';

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface WarRoomState {
  news: NewsArticle[];
  markets: MarketData[];
  social: SocialPost[];
  selectedArticle: ParsedArticle | null;
  articleLoading: boolean;
  connected: boolean;
}

const initialState: WarRoomState = {
  news: mockNews,
  markets: mockMarkets,
  social: mockSocial,
  selectedArticle: null,
  articleLoading: false,
  connected: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type WarRoomAction =
  | { type: 'SET_NEWS'; payload: NewsArticle[] }
  | { type: 'SET_MARKETS'; payload: MarketData[] }
  | { type: 'SET_SOCIAL'; payload: SocialPost[] }
  | { type: 'SET_ARTICLE'; payload: ParsedArticle | null }
  | { type: 'SET_ARTICLE_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function warRoomReducer(state: WarRoomState, action: WarRoomAction): WarRoomState {
  switch (action.type) {
    case 'SET_NEWS':
      return { ...state, news: action.payload };
    case 'SET_MARKETS':
      return { ...state, markets: action.payload };
    case 'SET_SOCIAL':
      return { ...state, social: action.payload };
    case 'SET_ARTICLE':
      return { ...state, selectedArticle: action.payload, articleLoading: false };
    case 'SET_ARTICLE_LOADING':
      return { ...state, articleLoading: action.payload };
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface WarRoomContextValue {
  state: WarRoomState;
  dispatch: React.Dispatch<WarRoomAction>;
}

const WarRoomContext = createContext<WarRoomContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WarRoomProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(warRoomReducer, initialState);

  return (
    <WarRoomContext.Provider value={{ state, dispatch }}>
      {children}
    </WarRoomContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWarRoom(): WarRoomContextValue {
  const ctx = useContext(WarRoomContext);
  if (!ctx) {
    throw new Error('useWarRoom must be used within a WarRoomProvider');
  }
  return ctx;
}
