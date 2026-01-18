import { create } from 'zustand';

const API_BASE = '/api';

// Initial state
const initialState = {
  // Session data
  session: null,
  accessToken: null,
  isLoading: true,
  error: null,
  
  // Client branding
  client: {
    name: '',
    logo_url: null,
    primary_color: '#FF6B35',
    secondary_color: '#1A1A2E',
  },
  
  // Players
  players: [],
  
  // Responsibilities and assignments
  templates: [],
  assignments: [],
  
  // Game state
  pathChosen: null,
  companyProfile: {
    employeeCount: 25,
    locationCount: 1,
    hasRemoteWorkers: false,
    priorities: [],
    industryTags: [],
    currentSituation: '',
  },
  
  // UI state
  expandedItems: new Set(),
  selectedItem: null,
  isJaneChatOpen: false,
  
  // Stats
  stats: {
    handled: 0,
    need_help: 0,
    unknown: 0,
    unassigned: 0,
    total: 0,
    progress: 0,
  },
};

export const useGameStore = create((set, get) => ({
  ...initialState,
  
  // ============ Session Actions ============
  
  loadSession: async (token) => {
    set({ isLoading: true, error: null, accessToken: token });
    
    try {
      const response = await fetch(`${API_BASE}/sessions/token/${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game session not found. Please check your link.');
        }
        throw new Error('Failed to load session');
      }
      
      const data = await response.json();
      
      set({
        session: data,
        client: {
          name: data.client_name,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
        },
        players: data.players || [],
        pathChosen: data.path_chosen,
        companyProfile: data.company_profile || initialState.companyProfile,
        isLoading: false,
      });
      
      // Load assignments
      await get().loadAssignments(data.id);
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateSession: async (updates) => {
    const { session } = get();
    if (!session) return;
    
    try {
      const response = await fetch(`${API_BASE}/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update session');
      
      const data = await response.json();
      set({ session: data });
      
    } catch (error) {
      console.error('Update session error:', error);
    }
  },
  
  // ============ Company Profile Actions ============
  
  setCompanyProfile: (profile) => {
    set((state) => ({
      companyProfile: { ...state.companyProfile, ...profile }
    }));
  },
  
  saveCompanyProfile: async () => {
    const { companyProfile } = get();
    await get().updateSession({ company_profile: companyProfile });
  },
  
  // ============ Path Selection ============
  
  setPath: async (path) => {
    set({ pathChosen: path });
    await get().updateSession({ path_chosen: path, status: 'in_progress' });
  },
  
  // ============ Assignments Actions ============
  
  loadAssignments: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/responsibilities/assignments/${sessionId}`);
      if (!response.ok) throw new Error('Failed to load assignments');
      
      const data = await response.json();
      set({ assignments: data });
      
      // Calculate stats
      get().calculateStats();
      
    } catch (error) {
      console.error('Load assignments error:', error);
    }
  },
  
  updateAssignment: async (assignmentId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/responsibilities/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update assignment');
      
      const data = await response.json();
      
      set((state) => ({
        assignments: state.assignments.map(a => 
          a.id === assignmentId ? { ...a, ...data, ...updates } : a
        )
      }));
      
      get().calculateStats();
      
    } catch (error) {
      console.error('Update assignment error:', error);
    }
  },
  
  moveToFile: async (templateId, pile, playerId = null) => {
    const { assignments, session } = get();
    const assignment = assignments.find(a => a.template_id === templateId);
    
    if (!assignment) return;
    
    // Get all descendants for cascade
    const descendants = await get().getDescendants(templateId);
    const templateIds = [templateId, ...descendants];
    
    // Find assignments for all descendants
    const assignmentsToUpdate = assignments.filter(a => 
      templateIds.includes(a.template_id)
    );
    
    // Optimistic update
    set((state) => ({
      assignments: state.assignments.map(a => {
        if (templateIds.includes(a.template_id)) {
          return { 
            ...a, 
            pile, 
            player_id: playerId || a.player_id 
          };
        }
        return a;
      })
    }));
    
    // API update
    try {
      await fetch(`${API_BASE}/responsibilities/assignments/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          template_ids: templateIds,
          pile,
          ...(playerId && { player_id: playerId }),
        }),
      });
      
      get().calculateStats();
      
    } catch (error) {
      console.error('Bulk update error:', error);
      // Reload on error
      await get().loadAssignments(session.id);
    }
  },
  
  assignPlayer: async (templateId, playerId) => {
    const { assignments, session } = get();
    const assignment = assignments.find(a => a.template_id === templateId);
    
    if (!assignment) return;
    
    // Get all descendants for cascade
    const descendants = await get().getDescendants(templateId);
    const templateIds = [templateId, ...descendants];
    
    // Optimistic update
    set((state) => ({
      assignments: state.assignments.map(a => {
        if (templateIds.includes(a.template_id)) {
          return { ...a, player_id: playerId };
        }
        return a;
      })
    }));
    
    // API update
    try {
      await fetch(`${API_BASE}/responsibilities/assignments/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          template_ids: templateIds,
          player_id: playerId,
        }),
      });
    } catch (error) {
      console.error('Assign player error:', error);
      await get().loadAssignments(session.id);
    }
  },
  
  getDescendants: async (templateId) => {
    try {
      const response = await fetch(`${API_BASE}/responsibilities/templates/${templateId}/descendants`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.filter(id => id !== templateId);
    } catch (error) {
      return [];
    }
  },
  
  // ============ Players Actions ============
  
  addPlayer: async (playerData) => {
    const { session } = get();
    if (!session) return;
    
    try {
      const response = await fetch(`${API_BASE}/players/session/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      
      if (!response.ok) throw new Error('Failed to add player');
      
      const data = await response.json();
      set((state) => ({ players: [...state.players, data] }));
      
      return data;
      
    } catch (error) {
      console.error('Add player error:', error);
      return null;
    }
  },
  
  removePlayer: async (playerId) => {
    try {
      const response = await fetch(`${API_BASE}/players/${playerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove player');
      
      set((state) => ({
        players: state.players.filter(p => p.id !== playerId)
      }));
      
      // Reload assignments as they may have changed
      const { session } = get();
      if (session) await get().loadAssignments(session.id);
      
    } catch (error) {
      console.error('Remove player error:', error);
    }
  },
  
  // ============ UI Actions ============
  
  toggleExpanded: (templateId) => {
    set((state) => {
      const newExpanded = new Set(state.expandedItems);
      if (newExpanded.has(templateId)) {
        newExpanded.delete(templateId);
      } else {
        newExpanded.add(templateId);
      }
      return { expandedItems: newExpanded };
    });
  },
  
  selectItem: (templateId) => {
    set({ selectedItem: templateId });
  },
  
  toggleJaneChat: () => {
    set((state) => ({ isJaneChatOpen: !state.isJaneChatOpen }));
  },
  
  closeJaneChat: () => {
    set({ isJaneChatOpen: false });
  },
  
  // ============ Stats ============
  
  calculateStats: () => {
    const { assignments } = get();
    
    const stats = {
      handled: 0,
      need_help: 0,
      unknown: 0,
      unassigned: 0,
      total: assignments.length,
    };
    
    assignments.forEach(a => {
      if (stats[a.pile] !== undefined) {
        stats[a.pile]++;
      }
    });
    
    stats.progress = stats.total > 0 
      ? Math.round(((stats.handled + stats.need_help + stats.unknown) / stats.total) * 100)
      : 0;
    
    set({ stats });
  },
  
  // ============ Game Completion ============
  
  completeGame: async () => {
    const { session } = get();
    if (!session) return null;
    
    try {
      const response = await fetch(`${API_BASE}/sessions/${session.id}/complete`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to complete game');
      
      const data = await response.json();
      set({ session: data.session });
      
      return data;
      
    } catch (error) {
      console.error('Complete game error:', error);
      return null;
    }
  },
  
  exportMarkdown: async () => {
    const { session } = get();
    if (!session) return null;
    
    try {
      const response = await fetch(`${API_BASE}/sessions/${session.id}/export`);
      if (!response.ok) throw new Error('Failed to export');
      
      const text = await response.text();
      return text;
      
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  },
  
  // ============ Reset ============
  
  reset: () => {
    set(initialState);
  },
}));

export default useGameStore;
