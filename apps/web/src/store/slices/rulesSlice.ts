import {
  createSlice,
  createAsyncThunk,
  isFulfilled,
  isPending,
  isRejected,
  PayloadAction,
} from "@reduxjs/toolkit";
import { getSupabase } from "@/lib/supabase";
import { ReviewRule, RuleCategory, RuleSeverity } from "@/types";

export interface RuleInput {
  rule: string;
  category: RuleCategory;
  severity: RuleSeverity;
  active?: boolean;
}

// Com RLS, update/delete bloqueados não retornam erro: só afetam 0 linhas.
const BLOCKED_MESSAGE =
  "Nenhuma regra foi alterada. Verifique as permissões (RLS) no Supabase.";

export const fetchRules = createAsyncThunk(
  "rules/fetchRules",
  async (teamId: string) => {
    const { data, error } = await getSupabase()
      .from("review_rules")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as ReviewRule[];
  }
);

export const createRule = createAsyncThunk(
  "rules/createRule",
  async ({ teamId, input }: { teamId: string; input: RuleInput }) => {
    const { data, error } = await getSupabase()
      .from("review_rules")
      .insert({ ...input, team_id: teamId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ReviewRule;
  }
);

export const updateRule = createAsyncThunk(
  "rules/updateRule",
  async ({ id, input }: { id: string; input: RuleInput }) => {
    const { data, error } = await getSupabase()
      .from("review_rules")
      .update(input)
      .eq("id", id)
      .select();
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(BLOCKED_MESSAGE);
    return data[0] as ReviewRule;
  }
);

export const deleteRule = createAsyncThunk(
  "rules/deleteRule",
  async (id: string) => {
    const { data, error } = await getSupabase()
      .from("review_rules")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error(BLOCKED_MESSAGE);
    return id;
  }
);

interface RulesState {
  items: ReviewRule[];
  fetchError: string | null;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
  categoryFilter: RuleCategory | "all";
  severityFilter: RuleSeverity | "all";
  isModalOpen: boolean;
  editingRuleId: string | null;
}

const initialState: RulesState = {
  items: [],
  fetchError: null,
  loading: false,
  saving: false,
  saveError: null,
  categoryFilter: "all",
  severityFilter: "all",
  isModalOpen: false,
  editingRuleId: null,
};

const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    setCategoryFilter(state, action: PayloadAction<RuleCategory | "all">) {
      state.categoryFilter = action.payload;
    },
    setSeverityFilter(state, action: PayloadAction<RuleSeverity | "all">) {
      state.severityFilter = action.payload;
    },
    openModal(state, action: PayloadAction<string | null>) {
      state.isModalOpen = true;
      state.editingRuleId = action.payload;
      state.saveError = null;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.editingRuleId = null;
      state.saveError = null;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRules.pending, (state) => {
        state.loading = true;
        state.fetchError = null;
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.fetchError = null;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.fetchError =
          action.error.message ?? "Não foi possível carregar as regras.";
      })
      .addCase(createRule.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isModalOpen = false;
        state.editingRuleId = null;
      })
      .addCase(updateRule.fulfilled, (state, action) => {
        const i = state.items.findIndex((r) => r.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
        state.isModalOpen = false;
        state.editingRuleId = null;
      })
      .addCase(deleteRule.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addMatcher(isPending(createRule, updateRule, deleteRule), (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addMatcher(isFulfilled(createRule, updateRule, deleteRule), (state) => {
        state.saving = false;
      })
      .addMatcher(
        isRejected(createRule, updateRule, deleteRule),
        (state, action) => {
          state.saving = false;
          state.saveError =
            action.error.message ?? "Não foi possível salvar a regra.";
        }
      );
  },
});

export const {
  setCategoryFilter,
  setSeverityFilter,
  openModal,
  closeModal,
  clearSaveError,
} = rulesSlice.actions;
export default rulesSlice.reducer;
