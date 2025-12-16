'use client';

import { useLookup, useRefreshLookup } from '@/queries';
import { useEffect } from 'react';
import { getWSClient, WSClient } from '@/lib/wsClient';
import { WS_EVENTS } from '@containerly/common';
import { useQueryClient } from '@tanstack/react-query';

export function useLookupDetail(id: string | null) {
  const { data: lookup, isLoading, error } = useLookup(id);
  const refreshLookup = useRefreshLookup();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;

    let wsClient: WSClient | null = null;
    let unsubscribe: (() => void) | null = null;

    const setupWebSocket = async () => {
      try {
        wsClient = getWSClient();
        if (!wsClient.isConnected()) {
          await wsClient.connect();
        }

        unsubscribe = wsClient.on(WS_EVENTS.LOOKUP_UPDATE, (data) => {
          if (data.id === id) {
            queryClient.invalidateQueries({ queryKey: ['lookup', id] });
          }
        });

        wsClient.on(WS_EVENTS.LOOKUP_COMPLETE, (data) => {
          if (data.id === id) {
            queryClient.invalidateQueries({ queryKey: ['lookup', id] });
          }
        });

        wsClient.on(WS_EVENTS.LOOKUP_ERROR, (data) => {
          if (data.id === id) {
            queryClient.invalidateQueries({ queryKey: ['lookup', id] });
          }
        });
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id, queryClient]);

  const handleRefresh = async () => {
    if (id) {
      await refreshLookup.mutateAsync(id);
    }
  };

  return {
    lookup,
    isLoading,
    error,
    refresh: handleRefresh,
    isRefreshing: refreshLookup.isPending,
  };
}




