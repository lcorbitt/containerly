'use client';

import { useEffect } from 'react';
import { useLookups } from '@/queries';
import { getWSClient, WSClient } from '@/lib/wsClient';
import { WS_EVENTS } from '@containerly/common';
import { useQueryClient } from '@tanstack/react-query';

export function useResultsPanel() {
  const { data: lookups, isLoading, error } = useLookups();
  const queryClient = useQueryClient();

  useEffect(() => {
    let wsClient: WSClient | null = null;
    let unsubscribe: (() => void) | null = null;

    const setupWebSocket = async () => {
      try {
        wsClient = getWSClient();
        await wsClient.connect();

        unsubscribe = wsClient.on(WS_EVENTS.LOOKUP_UPDATE, (data) => {
          queryClient.invalidateQueries({ queryKey: ['lookups'] });
          queryClient.invalidateQueries({ queryKey: ['lookup', data.id] });
        });

        wsClient.on(WS_EVENTS.LOOKUP_COMPLETE, (data) => {
          queryClient.invalidateQueries({ queryKey: ['lookups'] });
          queryClient.invalidateQueries({ queryKey: ['lookup', data.id] });
        });

        wsClient.on(WS_EVENTS.LOOKUP_ERROR, (data) => {
          queryClient.invalidateQueries({ queryKey: ['lookups'] });
          queryClient.invalidateQueries({ queryKey: ['lookup', data.id] });
        });
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (unsubscribe) unsubscribe();
      if (wsClient) wsClient.disconnect();
    };
  }, [queryClient]);

  return {
    lookups: lookups || [],
    isLoading,
    error,
  };
}

