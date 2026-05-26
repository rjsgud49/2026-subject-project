import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

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

export const TICKETS_PER_PURCHASE = 3;

const EMPTY: TicketState = { doc: 0, video: 0, premium: 0 };

function mapHistory(
  rows: Array<{
    id: string;
    plan_id: string;
    plan_name: string;
    price: number;
    count: number;
    purchased_at: string;
  }>,
): PurchaseRecord[] {
  return rows.map((r) => ({
    id: r.id,
    planId: r.plan_id as keyof TicketState,
    planName: r.plan_name,
    price: r.price,
    count: r.count,
    purchasedAt: r.purchased_at,
  }));
}

export function useFeedbackTickets(isLoggedIn = true) {
  const [tickets, setTickets] = useState<TicketState>(EMPTY);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setTickets(EMPTY);
      setPurchaseHistory([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.feedback.tickets();
      setTickets(data.tickets ?? EMPTY);
      setPurchaseHistory(mapHistory(data.purchase_history ?? []));
    } catch {
      setTickets(EMPTY);
      setPurchaseHistory([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** @deprecated 서버에서 결제 완료 시 자동 충전됩니다. refresh() 사용 */
  const purchaseTickets = useCallback((_planId: keyof TicketState) => {
    void refresh();
  }, [refresh]);

  /** @deprecated 신청 시 서버에서 이용권을 차감합니다 */
  const useTicket = useCallback((_planId: keyof TicketState): boolean => true, []);

  return {
    tickets,
    purchaseHistory,
    purchaseTickets,
    useTicket,
    refresh,
    loading,
    TICKETS_PER_PURCHASE,
  };
}
