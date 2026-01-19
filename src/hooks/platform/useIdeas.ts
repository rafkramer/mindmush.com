import { useState, useEffect, useCallback } from 'react';
import { getIdeas, saveIdeas, generateId } from '../../utils/platform/storage';
import type { Idea, IdeaCategory } from '../../utils/platform/types';
import type { IdeaStatus } from '../../utils/platform/constants';

export function useIdeas() {
  const [ideas, setIdeasState] = useState<Idea[]>([]);

  useEffect(() => {
    setIdeasState(getIdeas());
  }, []);

  const refresh = useCallback(() => {
    setIdeasState(getIdeas());
  }, []);

  const addIdea = useCallback((ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Idea => {
    const currentIdeas = getIdeas();
    const now = new Date().toISOString();
    const newIdea: Idea = {
      ...ideaData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updatedIdeas = [newIdea, ...currentIdeas];
    saveIdeas(updatedIdeas);
    setIdeasState(updatedIdeas);
    return newIdea;
  }, []);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>): boolean => {
    const currentIdeas = getIdeas();
    const index = currentIdeas.findIndex(i => i.id === id);
    if (index === -1) return false;
    const updatedIdeas = currentIdeas.map((i, idx) =>
      idx === index ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    );
    saveIdeas(updatedIdeas);
    setIdeasState(updatedIdeas);
    return true;
  }, []);

  const updateIdeaStatus = useCallback((id: string, status: IdeaStatus): boolean => {
    return updateIdea(id, { status });
  }, [updateIdea]);

  const markAsConverted = useCallback((ideaId: string, ventureId: string): boolean => {
    return updateIdea(ideaId, { convertedToVentureId: ventureId });
  }, [updateIdea]);

  const deleteIdea = useCallback((id: string): boolean => {
    const currentIdeas = getIdeas();
    const filtered = currentIdeas.filter(i => i.id !== id);
    if (filtered.length === currentIdeas.length) return false;
    saveIdeas(filtered);
    setIdeasState(filtered);
    return true;
  }, []);

  const getByCategory = useCallback((category: IdeaCategory): Idea[] => {
    return ideas.filter(i => i.category === category);
  }, [ideas]);

  const getByVenture = useCallback((ventureId: string): Idea[] => {
    return ideas.filter(i => i.ventureId === ventureId);
  }, [ideas]);

  const searchIdeas = useCallback((query: string): Idea[] => {
    const lowerQuery = query.toLowerCase();
    return ideas.filter(i =>
      i.title.toLowerCase().includes(lowerQuery) ||
      i.description?.toLowerCase().includes(lowerQuery) ||
      i.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [ideas]);

  return {
    ideas,
    refresh,
    addIdea,
    updateIdea,
    updateIdeaStatus,
    markAsConverted,
    deleteIdea,
    getByCategory,
    getByVenture,
    searchIdeas,
  };
}
