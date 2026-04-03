import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { AudioSnippet as SupabaseSnippet } from '../lib/supabase';
import { useNotifications } from '../components/NotificationSystem';

interface AudioSnippet {
  id: string;
  title: string;
  artist: string;
  duration: number;
  price: number;
  mood: string[];
  bpm: number;
  genre: string;
  audioUrl: string;
  waveformData: number[];
  artistId: string;
  isLicensed: boolean;
}

interface AudioContextType {
  snippets: AudioSnippet[];
  loading: boolean;
  currentlyPlaying: string | null;
  addSnippet: (snippet: Omit<AudioSnippet, 'id' | 'isLicensed'>) => void;
  playSnippet: (id: string) => void;
  pauseSnippet: () => void;
  licenseSnippet: (id: string) => Promise<string>;
  searchSnippets: (query: string, filters: any) => AudioSnippet[];
  refreshSnippets: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [snippets, setSnippets] = useState<AudioSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    refreshSnippets();
  }, []);


  const refreshSnippets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('audio_snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSnippets: AudioSnippet[] = data.map((snippet: SupabaseSnippet) => ({
        id: snippet.id,
        title: snippet.title,
        artist: snippet.artist,
        duration: snippet.duration,
        price: Number(snippet.price),
        mood: snippet.mood || [],
        bpm: snippet.bpm,
        genre: snippet.genre,
        audioUrl: snippet.audio_url,
        waveformData: snippet.waveform_data?.map(Number) || Array.from({ length: 100 }, () => Math.random()),
        artistId: snippet.artist_id,
        isLicensed: snippet.is_licensed
      }));

      setSnippets(formattedSnippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      addNotification({
        type: 'error',
        title: 'Database Connection Error',
        message: 'Please check your Supabase configuration and try again.'
      });
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  const addSnippet = async (snippet: Omit<AudioSnippet, 'id' | 'isLicensed'>) => {
    try {
      const { data, error } = await supabase
        .from('audio_snippets')
        .insert({
          title: snippet.title,
          artist: snippet.artist,
          duration: snippet.duration,
          price: snippet.price,
          mood: snippet.mood,
          bpm: snippet.bpm,
          genre: snippet.genre,
          audio_url: snippet.audioUrl,
          waveform_data: snippet.waveformData,
          is_licensed: false
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh snippets to get the latest data
      await refreshSnippets();
      
      addNotification({
        type: 'success',
        title: 'Snippet Uploaded',
        message: `"${snippet.title}" has been successfully uploaded and is now available for licensing`
      });
    } catch (error) {
      console.error('Error adding snippet:', error);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'There was an error uploading your snippet. Please try again.'
      });
      throw error;
    }
  };

  const playSnippet = (id: string) => {
    setCurrentlyPlaying(id);
  };

  const pauseSnippet = () => {
    setCurrentlyPlaying(null);
  };

  const licenseSnippet = async (id: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const snippet = snippets.find(s => s.id === id);
      if (!snippet) throw new Error('Snippet not found');

      // Create license record
      const { data, error } = await supabase
        .from('snippet_licenses')
        .insert({
          snippet_id: id,
          user_id: user.id,
          price_paid: snippet.price,
          license_type: 'Content Creator License'
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh snippets to update licensing status
      await refreshSnippets();

      addNotification({
        type: 'success',
        title: 'License Created',
        message: `License for "${snippet.title}" has been generated and sent to your email`
      });

      return data.id;
    } catch (error) {
      console.error('Error licensing snippet:', error);
      addNotification({
        type: 'error',
        title: 'License Failed',
        message: 'There was an error creating your license. Please try again.'
      });
      throw error;
    }
  };

  const searchSnippets = (query: string, filters: any) => {
    return snippets.filter(snippet => {
      const matchesQuery = !query || 
        snippet.title.toLowerCase().includes(query.toLowerCase()) ||
        snippet.artist.toLowerCase().includes(query.toLowerCase()) ||
        snippet.mood.some(m => m.toLowerCase().includes(query.toLowerCase()));
      
      const matchesGenre = !filters.genre || snippet.genre === filters.genre;
      const matchesMood = !filters.mood || snippet.mood.includes(filters.mood);
      const matchesPriceRange = (!filters.minPrice || snippet.price >= filters.minPrice) &&
                               (!filters.maxPrice || snippet.price <= filters.maxPrice);
      
      return matchesQuery && matchesGenre && matchesMood && matchesPriceRange;
    });
  };

  const value = {
    snippets,
    loading,
    currentlyPlaying,
    addSnippet,
    playSnippet,
    pauseSnippet,
    licenseSnippet,
    searchSnippets,
    refreshSnippets
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}