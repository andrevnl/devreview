import { useEffect, useState } from "react";
import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdrs,
  setStatusFilter,
  openModal,
  closeModal,
  clearSaveError,
  createAdr,
  updateAdr,
  deleteAdr,
} from "@/store/slices/adrsSlice";
import { TEAM_ID } from "@/lib/team";
import { Adr, AdrStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  AdrStatus,
  { label: string; className: string }
> = {
  proposed: {
    label: "Proposta",
    className:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  },
  accepted: {
    label: "Aceita",
    className:
      "bg-green-500/20 text-green-400 border border-green-500/30",
  },
  deprecated: {
    label: "Depreciada",
    className:
      "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function adrCode(adr: Adr): string {
  return `ADR-${adr.id.slice(0, 3).toUpperCase()}`;
}

const tabItems: { value: AdrStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "proposed", label: "Propostas" },
  { value: "accepted", label: "Aceitas" },
  { value: "deprecated", label: "Depreciadas" },
];

function StatusBadge({ status }: { status: AdrStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={cn(
        "flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

const fieldClass =
  "border-gray-700 bg-gray-800 text-white placeholder:text-gray-600";

export function AdrsPage() {
  const dispatch = useAppDispatch();
  const {
    items: adrs,
    statusFilter,
    isModalOpen,
    editingAdrId,
    saving,
    saveError,
  } = useAppSelector((s) => s.adrs);

  const [formTitle, setFormTitle] = useState("");
  const [formContext, setFormContext] = useState("");
  const [formDecision, setFormDecision] = useState("");
  const [formStatus, setFormStatus] = useState<AdrStatus>("proposed");
  const [adrToView, setAdrToView] = useState<Adr | null>(null);
  const [adrToDelete, setAdrToDelete] = useState<Adr | null>(null);

  useEffect(() => {
    dispatch(fetchAdrs(TEAM_ID));
  }, [dispatch]);

  const editingAdr = editingAdrId
    ? adrs.find((a) => a.id === editingAdrId)
    : null;

  function handleOpenNew() {
    setFormTitle("");
    setFormContext("");
    setFormDecision("");
    setFormStatus("proposed");
    dispatch(openModal(null));
  }

  function handleOpenEdit(adr: Adr) {
    setAdrToView(null);
    setFormTitle(adr.title);
    setFormContext(adr.context);
    setFormDecision(adr.decision);
    setFormStatus(adr.status);
    dispatch(openModal(adr.id));
  }

  const canSave =
    formTitle.trim() !== "" &&
    formContext.trim() !== "" &&
    formDecision.trim() !== "";

  async function handleSave() {
    if (!canSave) return;
    const input = {
      title: formTitle.trim(),
      context: formContext.trim(),
      decision: formDecision.trim(),
      status: formStatus,
    };
    if (editingAdrId) {
      await dispatch(updateAdr({ id: editingAdrId, input }));
    } else {
      await dispatch(createAdr({ teamId: TEAM_ID, input }));
    }
  }

  function handleOpenDelete(adr: Adr) {
    setAdrToView(null);
    dispatch(clearSaveError());
    setAdrToDelete(adr);
  }

  async function handleConfirmDelete() {
    if (!adrToDelete) return;
    const result = await dispatch(deleteAdr(adrToDelete.id));
    if (deleteAdr.fulfilled.match(result)) setAdrToDelete(null);
  }

  const filtered =
    statusFilter === "all"
      ? adrs
      : adrs.filter((a) => a.status === statusFilter);

  const countByStatus = (status: AdrStatus) =>
    adrs.filter((a) => a.status === status).length;

  return (
    <div className="flex flex-col overflow-y-auto">
      <Header
        title="ADRs — Decisões de Arquitetura"
        action={
          <Button
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
            onClick={handleOpenNew}
          >
            <Plus className="h-4 w-4" />
            Nova ADR
          </Button>
        }
      />

      <div className="flex-1 space-y-5 p-6">
        {/* Tabs filter */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => dispatch(setStatusFilter(v as AdrStatus | "all"))}
        >
          <TabsList className="bg-gray-900 border border-gray-800">
            {tabItems.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
              >
                {label}
                {value !== "all" && (
                  <span className="ml-1.5 text-xs text-gray-600">
                    ({countByStatus(value as AdrStatus)})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((adr) => (
            <div
              key={adr.id}
              className="flex flex-col rounded-lg border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="text-left text-sm font-semibold leading-snug text-white hover:text-indigo-300"
                  onClick={() => setAdrToView(adr)}
                >
                  {adr.title}
                </button>
                <StatusBadge status={adr.status} />
              </div>

              {/* Date */}
              <p className="mt-1 text-xs text-gray-600">
                {formatDate(adr.created_at)}
              </p>

              {/* Context */}
              <div className="mt-3 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Contexto
                </p>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                  {adr.context}
                </p>
              </div>

              {/* Decision */}
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Decisão
                </p>
                <p className="mt-1 text-sm italic text-gray-400 line-clamp-2">
                  {adr.decision}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">{adrCode(adr)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-white"
                    aria-label="Ver ADR completa"
                    onClick={() => setAdrToView(adr)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-white"
                    aria-label="Editar ADR"
                    onClick={() => handleOpenEdit(adr)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-400"
                    aria-label="Excluir ADR"
                    onClick={() => handleOpenDelete(adr)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-gray-500">
              Nenhuma ADR encontrada para este filtro.
            </div>
          )}
        </div>
      </div>

      {/* Detalhes */}
      <Dialog
        open={adrToView !== null}
        onOpenChange={(open) => !open && setAdrToView(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-gray-800 bg-gray-900 text-white sm:max-w-2xl">
          {adrToView && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3 pr-6">
                  <DialogTitle className="leading-snug">
                    {adrToView.title}
                  </DialogTitle>
                  <StatusBadge status={adrToView.status} />
                </div>
                <DialogDescription className="text-gray-500">
                  {adrCode(adrToView)} · {formatDate(adrToView.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Contexto
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">
                    {adrToView.context}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Decisão
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm italic text-gray-300">
                    {adrToView.decision}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  className="gap-2 text-gray-400 hover:text-red-400"
                  onClick={() => handleOpenDelete(adrToView)}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
                <Button
                  className="gap-2 bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => handleOpenEdit(adrToView)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de criação/edição */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => !open && !saving && dispatch(closeModal())}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-800 bg-gray-900 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAdr ? "Editar ADR" : "Nova ADR"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="adr-title" className="text-gray-300">
                Título
              </Label>
              <Input
                id="adr-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Usar Redux Toolkit para estado global"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adr-context" className="text-gray-300">
                Contexto
              </Label>
              <Textarea
                id="adr-context"
                rows={4}
                value={formContext}
                onChange={(e) => setFormContext(e.target.value)}
                placeholder="Qual problema ou situação motivou a decisão?"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adr-decision" className="text-gray-300">
                Decisão
              </Label>
              <Textarea
                id="adr-decision"
                rows={4}
                value={formDecision}
                onChange={(e) => setFormDecision(e.target.value)}
                placeholder="O que foi decidido e por quê?"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-300">Status</Label>
              <Select
                value={formStatus}
                onValueChange={(v) => setFormStatus(v as AdrStatus)}
              >
                <SelectTrigger className="w-48 border-gray-700 bg-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  <SelectItem value="proposed">Proposta</SelectItem>
                  <SelectItem value="accepted">Aceita</SelectItem>
                  <SelectItem value="deprecated">Depreciada</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Só ADRs aceitas são consultadas pelo agente nos reviews.
              </p>
            </div>

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
              disabled={saving || !canSave}
              onClick={handleSave}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <Dialog
        open={adrToDelete !== null}
        onOpenChange={(open) => !open && !saving && setAdrToDelete(null)}
      >
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir ADR</DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. A ADR abaixo será removida do
              banco de dados.
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-md border border-gray-800 bg-gray-800/50 px-3 py-2 text-sm">
            {adrToDelete?.title}
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
              onClick={() => setAdrToDelete(null)}
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
