import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FieldError } from "@/components/shared/FieldError";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchRules,
  setCategoryFilter,
  setSeverityFilter,
  openModal,
  closeModal,
  clearSaveError,
  createRule,
  updateRule,
  deleteRule,
} from "@/store/slices/rulesSlice";
import { TEAM_ID } from "@/lib/team";
import { FIELD_LIMITS } from "@/lib/validation";
import {
  RuleFormValues,
  emptyRuleForm,
  getRuleFormErrors,
  ruleToForm,
  toRuleInput,
} from "@/lib/forms/ruleForm";
import { ReviewRule, RuleCategory, RuleSeverity } from "@/types";

export function RulesPage() {
  const dispatch = useAppDispatch();
  const {
    items: rules,
    categoryFilter,
    severityFilter,
    isModalOpen,
    editingRuleId,
    saving,
    saveError,
  } = useAppSelector((s) => s.rules);

  const [form, setForm] = useState<RuleFormValues>(emptyRuleForm);
  const [ruleToDelete, setRuleToDelete] = useState<ReviewRule | null>(null);

  useEffect(() => {
    dispatch(fetchRules(TEAM_ID));
  }, [dispatch]);

  const editingRule = editingRuleId
    ? rules.find((r) => r.id === editingRuleId)
    : null;

  function setField<K extends keyof RuleFormValues>(
    field: K,
    value: RuleFormValues[K]
  ) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleOpenNew() {
    setForm(emptyRuleForm());
    dispatch(openModal(null));
  }

  function handleOpenEdit(id: string) {
    const rule = rules.find((r) => r.id === id);
    if (rule) {
      setForm(ruleToForm(rule));
      dispatch(openModal(id));
    }
  }

  const formErrors = getRuleFormErrors(form);
  const ruleInput = toRuleInput(form);

  async function handleSave() {
    if (!ruleInput) return;
    if (editingRuleId) {
      await dispatch(updateRule({ id: editingRuleId, input: ruleInput }));
    } else {
      await dispatch(createRule({ teamId: TEAM_ID, input: ruleInput }));
    }
  }

  function handleOpenDelete(rule: ReviewRule) {
    dispatch(clearSaveError());
    setRuleToDelete(rule);
  }

  async function handleConfirmDelete() {
    if (!ruleToDelete) return;
    const result = await dispatch(deleteRule(ruleToDelete.id));
    if (deleteRule.fulfilled.match(result)) setRuleToDelete(null);
  }

  const filtered = rules.filter((rule) => {
    const matchCategory =
      categoryFilter === "all" || rule.category === categoryFilter;
    const matchSeverity =
      severityFilter === "all" || rule.severity === severityFilter;
    return matchCategory && matchSeverity;
  });

  return (
    <div className="flex flex-col overflow-y-auto">
      <Header
        title="Regras de Review"
        action={
          <Button
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
            onClick={handleOpenNew}
          >
            <Plus className="h-4 w-4" />
            Nova Regra
          </Button>
        }
      />

      <div className="flex-1 space-y-4 p-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            value={categoryFilter}
            onValueChange={(v) =>
              dispatch(setCategoryFilter(v as RuleCategory | "all"))
            }
          >
            <SelectTrigger className="w-44 border-gray-700 bg-gray-900 text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900">
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="style">Estilo</SelectItem>
              <SelectItem value="architecture">Arquitetura</SelectItem>
              <SelectItem value="security">Segurança</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={severityFilter}
            onValueChange={(v) =>
              dispatch(setSeverityFilter(v as RuleSeverity | "all"))
            }
          >
            <SelectTrigger className="w-40 border-gray-700 bg-gray-900 text-sm">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900">
              <SelectItem value="all">Todas severidades</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-auto text-xs text-gray-500">
            {filtered.length} regra{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-800 bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Regra</TableHead>
                <TableHead className="w-36 text-gray-400">Categoria</TableHead>
                <TableHead className="w-28 text-gray-400">Severidade</TableHead>
                <TableHead className="w-24 text-gray-400">Status</TableHead>
                <TableHead className="w-24 text-gray-400" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rule) => (
                <TableRow
                  key={rule.id}
                  className="border-gray-800 hover:bg-gray-800/50"
                >
                  <TableCell className="text-sm text-white">
                    {rule.rule}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={rule.category} />
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={rule.severity} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        rule.active
                          ? "inline-flex items-center rounded-full border border-green-500/30 bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400"
                          : "inline-flex items-center rounded-full border border-gray-600/30 bg-gray-600/20 px-2.5 py-0.5 text-xs font-medium text-gray-400"
                      }
                    >
                      {rule.active ? "Ativa" : "Inativa"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white"
                        aria-label="Editar regra"
                        onClick={() => handleOpenEdit(rule.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-400"
                        aria-label="Excluir regra"
                        onClick={() => handleOpenDelete(rule)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="border-gray-800">
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Nenhuma regra encontrada com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => !open && !saving && dispatch(closeModal())}
      >
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "Editar Regra" : "Nova Regra"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rule-text" className="text-gray-300">
                Descrição da regra
              </Label>
              <Input
                id="rule-text"
                value={form.rule}
                maxLength={FIELD_LIMITS.ruleText}
                onChange={(e) => setField("rule", e.target.value)}
                placeholder="Ex: Nunca expor tokens em código-fonte"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-600"
              />
              <FieldError message={formErrors.rule} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-300">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setField("category", v as RuleCategory)}
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900">
                    <SelectItem value="style">Estilo</SelectItem>
                    <SelectItem value="architecture">Arquitetura</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-300">Severidade</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => setField("severity", v as RuleSeverity)}
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-900">
                    <SelectItem value="error">Erro</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingRule && (
              <div className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-800/50 px-3 py-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="rule-active" className="text-gray-300">
                    Regra ativa
                  </Label>
                  <p className="text-xs text-gray-500">
                    Regras inativas ficam salvas, mas não são aplicadas nos
                    reviews.
                  </p>
                </div>
                <Switch
                  id="rule-active"
                  checked={form.active}
                  onCheckedChange={(v) => setField("active", v)}
                  className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-700"
                />
              </div>
            )}

            {saveError && (
              <p role="alert" className="text-sm text-red-400">
                {saveError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              disabled={saving}
              onClick={() => dispatch(closeModal())}
            >
              Cancelar
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-500"
              disabled={saving || !ruleInput}
              onClick={handleSave}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <Dialog
        open={ruleToDelete !== null}
        onOpenChange={(open) => !open && !saving && setRuleToDelete(null)}
      >
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir regra</DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. A regra abaixo será removida do
              banco de dados.
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-md border border-gray-800 bg-gray-800/50 px-3 py-2 text-sm">
            {ruleToDelete?.rule}
          </p>

          {saveError && (
            <p role="alert" className="text-sm text-red-400">
              {saveError}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              disabled={saving}
              onClick={() => setRuleToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-500"
              disabled={saving}
              onClick={handleConfirmDelete}
            >
              {saving ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
