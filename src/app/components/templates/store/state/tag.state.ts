export interface TagState {
    tags: string[];
    selectedTags: string[];
    error: string | null;
  }
  
  export const initialTagState: TagState = {
    tags: [],
    selectedTags: [], // currently selected tags (for chip list)
    error: null
  };
  