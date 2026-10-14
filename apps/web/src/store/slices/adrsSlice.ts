import {
  createSlice,
  createAsyncThunk,
  isFulfilled,
  isPending,
  isRejected,
  PayloadAction,
} from "@reduxjs/toolkit";
import { getSupabase } from "@/lib/supabase";
import { Adr, AdrStatus } from "@/types";

export interface AdrInput {
  title: string;
  context: string;
  decision: string;
  status: AdrStatus;
}

// Com RLS, update/delete bloqueados não retornam erro: só afetam 0 linhas.
const BLOCKED_MESSAGE =
  "Nenhuma ADR foi alterada. Verifique as permissões (RLS) no Supabase.";

export const fetchAdrs = createAsyncThunk(
  "adrs/fetchAdrs",
  async (teamId: string) => {
    const { data, error } = await getSupabase()
      .from("adrs")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as Adr[];
  }
);

export const createAdr = createAsyncThunk(
  "adrs/createAdr",
  async ({ teamId, input }: { teamId: string; input: AdrInput }) => {
    const { data, error } = await getSupabase()
      .from("adrs")
      .insert({ ...input, team_id: teamId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Adr;
  }
);

export const updateAdr = createAsyncThunk(
  "adrs/updateAdr",
  async ({ id, input }: { id: string; input: AdrInput }) => {
    const { data, error } = await getSupabase()
      .from("adrs")
      .update(input)
      .eq("id", id)
      .select();
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(BLOCKED_MESSAGE);
    return data[0] as Adr;
  }
);

export const deleteAdr = createAsyncThunk(
  "adrs/deleteAdr",
  async (id: string) => {
    const { data, error } = await getSupabase()
      .from("adrs")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(BLOCKED_MESSAGE);
    return id;
  }
);

interface AdrsState {
  items: Adr[];
  fetchError: string | null;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
  statusFilter: AdrStatus | "all";
  isModalOpen: boolean;
  editingAdrId: string | null;
}

const initialState: AdrsState = {
  items: [],
  fetchError: null,
  loading: false,
  saving: false,
  saveError: null,
  statusFilter: "all",
  isModalOpen: false,
  editingAdrId: null,
};

const adrsSlice = createSlice({
  name: "adrs",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<AdrStatus | "all">) {
      state.statusFilter = action.payload;
    },
    openModal(state, action: PayloadAction<string | null>) {
      state.isModalOpen = true;
      state.editingAdrId = action.payload;
      state.saveError = null;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.editingAdrId = null;
      state.saveError = null;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdrs.pending, (state) => {
        state.loading = true;
        state.fetchError = null;
      })
      .addCase(fetchAdrs.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.fetchError = null;
      })
      .addCase(fetchAdrs.rejected, (state, action) => {
        state.loading = false;
        state.fetchError =
          action.error.message ?? "Não foi possível carregar as ADRs.";
      })
      .addCase(createAdr.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isModalOpen = false;
        state.editingAdrId = null;
      })
      .addCase(updateAdr.fulfilled, (state, action) => {
        const i = state.items.findIndex((a) => a.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
        state.isModalOpen = false;
        state.editingAdrId = null;
      })
      .addCase(deleteAdr.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      })
      .addMatcher(isPending(createAdr, updateAdr, deleteAdr), (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addMatcher(isFulfilled(createAdr, updateAdr, deleteAdr), (state) => {
        state.saving = false;
      })
      .addMatcher(
        isRejected(createAdr, updateAdr, deleteAdr),
        (state, action) => {
          state.saving = false;
          state.saveError =
            action.error.message ?? "Não foi possível salvar a ADR.";
        }
      );
  },
});

export const { setStatusFilter, openModal, closeModal, clearSaveError } =
  adrsSlice.actions;
export default adrsSlice.reducer;
