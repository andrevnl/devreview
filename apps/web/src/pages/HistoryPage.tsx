import { useEffect, useState } from "react";
import { ExternalLink, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchHistory,
  setRepoFilter,
  openModal,
  closeModal,
  clearSaveError,
  createReview,
  updateReview,
  deleteReview,
} from "@/store/slices/historySlice";
import { TEAM_ID } from "@/lib/team";
import { ReviewHistory, RuleSeverity } from "@/types";

function issueSeverity(issues: number): RuleSeverity {
  if (issues >= 4) return "error";
  if (issues > 0) return "warning";
  return "info";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Data local no formato do <input type="date"> (YYYY-MM-DD).
function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultPrUrl(repo: string, prNumber: string): string {
  return repo && prNumber
    ? `https://github.com/${repo}/pull/${prNumber}`
    : "https://github.com/org/repo/pull/123";
}

const fieldClass =
  "border-gray-700 bg-gray-800 text-white placeholder:text-gray-600";

export function HistoryPage() {
  const dispatch = useAppDispatch();
  const {
    items: history,
    repoFilter,
    isModalOpen,
    editingReviewId,
    saving,
    saveError,
  } = useAppSelector((s) => s.history);

  const [formRepo, setFormRepo] = useState("");
  const [formPrNumber, setFormPrNumber] = useState("");
  const [formPrUrl, setFormPrUrl] = useState("");
  const [formIssues, setFormIssues] = useState("0");
  const [formSummary, setFormSummary] = useState("");
  const [formDate, setFormDate] = useState("");
  const [reviewToView, setReviewToView] = useState<ReviewHistory | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewHistory | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchHistory(TEAM_ID));
  }, [dispatch]);

  const editingReview = editingReviewId
    ? history.find((r) => r.id === editingReviewId)
    : null;

  function handleOpenNew() {
    setFormRepo("");
    setFormPrNumber("");
    setFormPrUrl("");
    setFormIssues("0");
    setFormSummary("");
    setFormDate(toDateInput(new Date()));
    dispatch(openModal(null));
  }

  function handleOpenEdit(review: ReviewHistory) {
    setReviewToView(null);
    setFormRepo(review.repo);
    setFormPrNumber(String(review.pr_number));
    setFormPrUrl(review.pr_url);
    setFormIssues(String(review.issues_found));
    setFormSummary(review.review_summary ?? "");
    setFormDate(toDateInput(new Date(review.reviewed_at)));
    dispatch(openModal(review.id));
  }

  const prNumber = Number(formPrNumber);
  const issues = Number(formIssues);
  const canSave =
    formRepo.trim() !== "" &&
    Number.isInteger(prNumber) &&
    prNumber > 0 &&
    formIssues !== "" &&
    Number.isInteger(issues) &&
    issues >= 0 &&
    formDate !== "";

  // Mantém o horário original se a data não mudou; senão usa meio-dia local,
  // para o dia não trocar por causa do fuso.
  function reviewedAtFromForm(): string {
    if (editingReview) {
      if (formDate === toDateInput(new Date(editingReview.reviewed_at))) {
        return editingReview.reviewed_at;
      }
    } else if (formDate === toDateInput(new Date())) {
      return new Date().toISOString();
    }
    return new Date(`${formDate}T12:00:00`).toISOString();
  }

  async function handleSave() {
    if (!canSave) return;
    const repo = formRepo.trim();
    const input = {
      repo,
      pr_number: prNumber,
      pr_url: formPrUrl.trim() || defaultPrUrl(repo, String(prNumber)),
      issues_found: issues,
      review_summary: formSummary.trim() || null,
      reviewed_at: reviewedAtFromForm(),
    };
    if (editingReviewId) {
      await dispatch(updateReview({ id: editingReviewId, input }));
    } else {
      await dispatch(createReview({ teamId: TEAM_ID, input }));
    }
  }

  function handleOpenDelete(review: ReviewHistory) {
    setReviewToView(null);
    dispatch(clearSaveError());
    setReviewToDelete(review);
  }

  async function handleConfirmDelete() {
    if (!reviewToDelete) return;
    const result = await dispatch(deleteReview(reviewToDelete.id));
    if (deleteReview.fulfilled.match(result)) setReviewToDelete(null);
  }

  const filtered = history.filter(
    (r) =>
      repoFilter === "" ||
      r.repo.toLowerCase().includes(repoFilter.toLowerCase())
  );

  const totalIssues = filtered.reduce((acc, r) => acc + r.issues_found, 0);
  const avgIssues =
    filtered.length > 0 ? (totalIssues / filtered.length).toFixed(1) : "0";

  return (
    <div className="flex flex-col overflow-y-auto">
      <Header
        title="Histórico de Reviews"
        action={
          <Button
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
            onClick={handleOpenNew}
          >
            <Plus className="h-4 w-4" />
            Novo Review
          </Button>
        }
      />

      <div className="flex-1 space-y-4 p-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="text-xs text-gray-400">Total de Reviews</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {filtered.length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="text-xs text-gray-400">Total de Issues</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalIssues}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="text-xs text-gray-400">Média por PR</p>
            <p className="mt-1 text-2xl font-bold text-white">{avgIssues}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <Input
            value={repoFilter}
            onChange={(e) => dispatch(setRepoFilter(e.target.value))}
            placeholder="Filtrar por repositório..."
            className="w-72 border-gray-700 bg-gray-900 text-white placeholder:text-gray-600"
          />
          <span className="ml-auto text-xs text-gray-500">
            {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-800 bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">PR</TableHead>
                <TableHead className="text-gray-400">Repositório</TableHead>
                <TableHead className="w-24 text-gray-400">Issues</TableHead>
                <TableHead className="text-gray-400">Resumo</TableHead>
                <TableHead className="w-28 text-gray-400">Data</TableHead>
                <TableHead className="w-40 text-gray-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((review) => (
                <TableRow
                  key={review.id}
                  className="border-gray-800 hover:bg-gray-800/50"
                >
                  <TableCell className="font-mono text-sm font-medium text-white">
                    #{review.pr_number}
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">
                    {review.repo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {review.issues_found}
                      </span>
                      <SeverityBadge severity={issueSeverity(review.issues_found)} />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-gray-400">
                      {review.review_summary ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(review.reviewed_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white"
                        aria-label="Ver review completo"
                        onClick={() => setReviewToView(review)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-white"
                        aria-label="Editar review"
                        onClick={() => handleOpenEdit(review)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-400"
                        aria-label="Excluir review"
                        onClick={() => handleOpenDelete(review)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <a
                        href={review.pr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Abrir PR no GitHub"
                        className="inline-flex h-8 w-8 items-center justify-center text-gray-500 hover:text-indigo-400 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="border-gray-800">
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Nenhum review encontrado para este repositório.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detalhes */}
      <Dialog
        open={reviewToView !== null}
        onOpenChange={(open) => !open && setReviewToView(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-gray-800 bg-gray-900 text-white sm:max-w-2xl">
          {reviewToView && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {reviewToView.repo}{" "}
                  <span className="font-mono">#{reviewToView.pr_number}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  {formatDate(reviewToView.reviewed_at)} ·{" "}
                  {reviewToView.issues_found} issue
                  {reviewToView.issues_found !== 1 ? "s" : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Resumo
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">
                    {reviewToView.review_summary ?? "Sem resumo."}
                  </p>
                </div>
                <a
                  href={reviewToView.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 break-all text-sm text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  {reviewToView.pr_url}
                </a>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  className="gap-2 text-gray-400 hover:text-red-400"
                  onClick={() => handleOpenDelete(reviewToView)}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
                <Button
                  className="gap-2 bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => handleOpenEdit(reviewToView)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-800 bg-gray-900 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Editar Review" : "Novo Review"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="review-repo" className="text-gray-300">
                  Repositório
                </Label>
                <Input
                  id="review-repo"
                  value={formRepo}
                  onChange={(e) => setFormRepo(e.target.value)}
                  placeholder="Ex: alura/devreview"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="review-pr" className="text-gray-300">
                  Nº do PR
                </Label>
                <Input
                  id="review-pr"
                  type="number"
                  min={1}
                  step={1}
                  value={formPrNumber}
                  onChange={(e) => setFormPrNumber(e.target.value)}
                  placeholder="142"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-url" className="text-gray-300">
                URL do PR
              </Label>
              <Input
                id="review-url"
                type="url"
                value={formPrUrl}
                onChange={(e) => setFormPrUrl(e.target.value)}
                placeholder={defaultPrUrl(formRepo.trim(), formPrNumber)}
                className={fieldClass}
              />
              <p className="text-xs text-gray-500">
                Se ficar em branco, é montada a partir do repositório e do
                número do PR.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="review-issues" className="text-gray-300">
                  Issues encontradas
                </Label>
                <Input
                  id="review-issues"
                  type="number"
                  min={0}
                  step={1}
                  value={formIssues}
                  onChange={(e) => setFormIssues(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="review-date" className="text-gray-300">
                  Data do review
                </Label>
                <Input
                  id="review-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-summary" className="text-gray-300">
                Resumo
              </Label>
              <Textarea
                id="review-summary"
                rows={4}
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="Principais pontos encontrados no review (opcional)"
                className={fieldClass}
              />
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
        open={reviewToDelete !== null}
        onOpenChange={(open) => !open && !saving && setReviewToDelete(null)}
      >
        <DialogContent className="border-gray-800 bg-gray-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir review</DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. O review abaixo será removido do
              banco de dados e deixa de contar nas métricas.
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-md border border-gray-800 bg-gray-800/50 px-3 py-2 text-sm">
            {reviewToDelete?.repo}{" "}
            <span className="font-mono">#{reviewToDelete?.pr_number}</span>
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
              onClick={() => setReviewToDelete(null)}
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
