import { useState, useCallback } from 'react';

const TICKET_KEY     = 'p1_feedback_tickets';
const HISTORY_KEY    = 'p1_feedback_purchase_history';
const TICKETS_PER_PURCHASE = 3;

export interface TicketState {
  doc: number;
  video: number;
  premium: number;
}

export interface PurchaseRecord {
  id: string;
  planId: keyof TicketState;
  planName: string;
  price: number;
  count: number;
  purchasedAt: string;
}

const PLAN_NAMES: Record<keyof TicketState, string> = {
  doc:     '문서 피드백',
  video:   '영상 피드백',
  premium: '심층 피드백',
};
const PLAN_PRICES: Record<keyof TicketState, number> = {
  doc:     39900,
  video:   59900,
  premium: 99900,
};

function loadTickets(): TicketState {
  try {
    const raw = localStorage.getItem(TICKET_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { doc: 0, video: 0, premium: 0 };
}

function saveTickets(t: TicketState) {
  localStorage.setItem(TICKET_KEY, JSON.stringify(t));
}

function loadHistory(): PurchaseRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(h: PurchaseRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export function useFeedbackTickets(isLoggedIn = true) {
  const [tickets, setTickets] = useState<TicketState>(() =>
    isLoggedIn ? loadTickets() : { doc: 0, video: 0, premium: 0 }
  );
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>(() =>
    isLoggedIn ? loadHistory() : []
  );

  /** 구매: planId에 3회 추가 + 구매 기록 저장 */
  const purchaseTickets = useCallback((planId: keyof TicketState) => {
    setTickets((prev) => {
      const next = { ...prev, [planId]: prev[planId] + TICKETS_PER_PURCHASE };
      saveTickets(next);
      return next;
    });
    setPurchaseHistory((prev) => {
      const record: PurchaseRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        planId,
        planName: PLAN_NAMES[planId],
        price: PLAN_PRICES[planId],
        count: TICKETS_PER_PURCHASE,
        purchasedAt: new Date().toISOString(),
      };
      const next = [record, ...prev];
      saveHistory(next);
      return next;
    });
  }, []);

  /** 사용: planId에서 1회 차감 (잔여 없으면 false 반환) */
  const useTicket = useCallback((planId: keyof TicketState): boolean => {
    const current = loadTickets();
    if (current[planId] <= 0) return false;
    const next = { ...current, [planId]: current[planId] - 1 };
    saveTickets(next);
    setTickets(next);
    return true;
  }, []);

  const refresh = useCallback(() => {
    if (isLoggedIn) {
      setTickets(loadTickets());
      setPurchaseHistory(loadHistory());
    }
  }, [isLoggedIn]);

  return { tickets, purchaseHistory, purchaseTickets, useTicket, refresh, TICKETS_PER_PURCHASE };
}
