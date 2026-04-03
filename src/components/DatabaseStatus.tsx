import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationSystem';

interface DatabaseStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export default function DatabaseStatus({ onStatusChange }: DatabaseStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkDatabaseConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkDatabaseConnection, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDatabaseConnection = async () => {
    setChecking(true);

    try {
      // Test database connection by trying to fetch from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      setIsConnected(true);
      setLastChecked(new Date());
      onStatusChange?.(true);

    } catch (error) {
      console.error('Database connection failed:', error);
      setIsConnected(false);
      setLastChecked(new Date());
      onStatusChange?.(false);

      // Only show notification if this is not the first check
      if (lastChecked !== null) {
        addNotification({
          type: 'error',
          title: 'Database Connection Lost',
          message: 'Unable to connect to database. Please check your Supabase configuration.'
        });
      }
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = () => {
    if (isConnected === null) return 'text-gray-400 bg-gray-500/20';
    return isConnected 
      ? 'text-green-400 bg-green-500/20' 
      : 'text-red-400 bg-red-500/20';
  };

  const getStatusIcon = () => {
    if (checking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (isConnected === null) return <Database className="h-4 w-4" />;
    return isConnected 
      ? <Wifi className="h-4 w-4" />
      : <WifiOff className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (checking) return 'Checking...';
    if (isConnected === null) return 'Unknown';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>Database: {getStatusText()}</span>
      </div>
      
      {lastChecked && (
        <span className="text-xs text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
      
      <button
        onClick={checkDatabaseConnection}
        disabled={checking}
        className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        title="Check database connection"
      >
        <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}