import {
  createSlice,
  createAsyncThunk,
  isFulfilled,
  isPending,
  isRejected,
  PayloadAction,
} from "@reduxjs/toolkit";
import { getSupabase } from "@/lib/supabase";
import { ReviewHistory } from "@/types";

export interface ReviewInput {
  repo: string;
  pr_number: number;
  pr_url: string;
  issues_found: number;
  review_summary: string | null;
  reviewed_at: string;
}

// Com RLS, update/delete bloqueados não retornam erro: só afetam 0 linhas.
const BLOCKED_MESSAGE =
  "Nenhum review foi alterado. Verifique as permissões (RLS) no Supabase.";

export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (teamId: string) => {
    const { data, error } = await getSupabase()
      .from("review_history")
      .select("*")
      .eq("team_id", teamId)
      .order("reviewed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as ReviewHistory[];
  }
);

export const createReview = createAsyncThunk(
  "history/createReview",
  async ({ teamId, input }: { teamId: string; input: ReviewInput }) => {
    const { data, error } = await getSupabase()
      .from("review_history")
      .insert({ ...input, team_id: teamId })
      .select()
      .single();
    if (error) throw new Error(saveErrorMessage(error));
    return data as ReviewHistory;
  }
);

export const updateReview = createAsyncThunk(
  "history/updateReview",
  async ({ id, input }: { id: string; input: ReviewInput }) => {
    const { data, error } = await getSupabase()
      .from("review_history")
      .update(input)
      .eq("id", id)
      .select();
    if (error) throw new Error(saveErrorMessage(error));
    if (!data?.length) throw new Error(BLOCKED_MESSAGE);
    return data[0] as ReviewHistory;
  }
);

export const deleteReview = createAsyncThunk(
  "history/deleteReview",
  async (id: string) => {
    const { data, error } = await getSupabase()
      .from("review_history")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(BLOCKED_MESSAGE);
    return id;
  }
);

// unique (team_id, repo, pr_number): cada PR tem um único review no histórico.
function saveErrorMessage(error: { code?: string; message: string }) {
  return error.code === "23505"
    ? "Já existe um review para este PR neste repositório. Edite o review existente."
    : error.message;
}

// Mantém a ordem do fetch (mais recente primeiro): a data pode mudar na edição.
function sortByReviewedAt(items: ReviewHistory[]) {
  items.sort((a, b) => b.reviewed_at.localeCompare(a.reviewed_at));
}

interface HistoryState {
  items: ReviewHistory[];
  fetchError: string | null;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
  repoFilter: string;
  isModalOpen: boolean;
  editingReviewId: string | null;
}

const initialState: HistoryState = {
  items: [],
  fetchError: null,
  loading: false,
  saving: false,
  saveError: null,
  repoFilter: "",
  isModalOpen: false,
  editingReviewId: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setRepoFilter(state, action: PayloadAction<string>) {
      state.repoFilter = action.payload;
    },
    openModal(state, action: PayloadAction<string | null>) {
      state.isModalOpen = true;
      state.editingReviewId = action.payload;
      state.saveError = null;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.editingReviewId = null;
      state.saveError = null;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.fetchError = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.fetchError = null;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.fetchError =
          action.error.message ?? "Não foi possível carregar o histórico.";
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.items.push(action.payload);
        sortByReviewedAt(state.items);
        state.isModalOpen = false;
        state.editingReviewId = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const i = state.items.findIndex((r) => r.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
        sortByReviewedAt(state.items);
        state.isModalOpen = false;
        state.editingReviewId = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addMatcher(
        isPending(createReview, updateReview, deleteReview),
        (state) => {
          state.saving = true;
          state.saveError = null;
        }
      )
      .addMatcher(
        isFulfilled(createReview, updateReview, deleteReview),
        (state) => {
          state.saving = false;
        }
      )
      .addMatcher(
        isRejected(createReview, updateReview, deleteReview),
        (state, action) => {
          state.saving = false;
          state.saveError =
            action.error.message ?? "Não foi possível salvar o review.";
        }
      );
  },
});

export const { setRepoFilter, openModal, closeModal, clearSaveError } =
  historySlice.actions;
export default historySlice.reducer;
