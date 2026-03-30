import { useState, useCallback } from 'react';

const TICKET_KEY = 'p1_feedback_tickets';
const TICKETS_PER_PURCHASE = 3;

export interface TicketState {
  doc: number;
  video: number;
  premium: number;
}

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

export function useFeedbackTickets() {
  const [tickets, setTickets] = useState<TicketState>(loadTickets);

  /** 구매: planId에 3회 추가 */
  const purchaseTickets = useCallback((planId: keyof TicketState) => {
    setTickets((prev) => {
      const next = { ...prev, [planId]: prev[planId] + TICKETS_PER_PURCHASE };
      saveTickets(next);
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
    setTickets(loadTickets());
  }, []);

  return { tickets, purchaseTickets, useTicket, refresh, TICKETS_PER_PURCHASE };
}
