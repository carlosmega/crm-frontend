"use client";

import { use, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuote } from "@/features/quotes/hooks/use-quotes";
import { useQuoteDetails } from "@/features/quotes/hooks/use-quote-details";
import {
  useDeleteQuote,
  useCancelQuote,
  useReviseQuote,
  useCloneQuote,
} from "@/features/quotes/hooks/use-quote-mutations";
import { QuoteInfoHeader } from "@/features/quotes/components/quote-info-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ✅ OPTIMIZACIÓN: Dynamic imports para dialogs y tabs (reducen bundle inicial)
const QuoteDetailTabs = dynamic(
  () => import("@/features/quotes/components/quote-detail-tabs").then(mod => ({ default: mod.QuoteDetailTabs })),
  { ssr: false }
);

const QuoteActivateDialog = dynamic(
  () =>
    import("@/features/quotes/components/quote-activate-dialog").then(
      (mod) => ({ default: mod.QuoteActivateDialog }),
    ),
  { ssr: false },
);

const QuoteCloseDialog = dynamic(
  () =>
    import("@/features/quotes/components/quote-close-dialog").then((mod) => ({
      default: mod.QuoteCloseDialog,
    })),
  { ssr: false },
);

const SaveAsTemplateDialog = dynamic(
  () =>
    import("@/features/quotes/components/save-as-template-dialog").then((mod) => ({
      default: mod.SaveAsTemplateDialog,
    })),
  { ssr: false },
);

const QuoteVersionComparisonDialog = dynamic(
  () =>
    import("@/features/quotes/components/quote-version-comparison-dialog").then((mod) => ({
      default: mod.QuoteVersionComparisonDialog,
    })),
  { ssr: false },
);
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import {
  Loader2,
  Copy,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  XCircle,
  FileCheck,
  FilePlus,
  FileX
} from "lucide-react";

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Quote Detail Page
 *
 * Vista detallada de un quote con todas sus líneas y acciones
 */
export default function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: quote, isLoading, error } = useQuote(id);
  const { data: quoteLines = [] } = useQuoteDetails(id);
  const { mutate: deleteQuote } = useDeleteQuote();
  const { mutate: cancelQuote } = useCancelQuote();
  const { mutate: reviseQuote } = useReviseQuote();
  const { mutate: cloneQuote, isPending: isCloning } = useCloneQuote();

  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [showLoseDialog, setShowLoseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSaveAsTemplateDialog, setShowSaveAsTemplateDialog] = useState(false);
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [versionComparisonIds, setVersionComparisonIds] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const handleDelete = () => {
    deleteQuote(id, {
      onSuccess: () => {
        router.push("/quotes");
      },
    });
  };

  const handleCancel = () => {
    cancelQuote(
      { id, reason: "Canceled by user" },
      {
        onSuccess: () => {
          setShowCancelDialog(false);
        },
      },
    );
  };

  const handleRevise = () => {
    reviseQuote(id);
  };

  const handleClone = () => {
    cloneQuote(id, {
      onSuccess: (clonedQuote) => {
        router.push(`/quotes/${clonedQuote.quoteid}`);
      },
    });
  };

  const handleCompareVersions = (fromId: string, toId: string) => {
    setVersionComparisonIds({ from: fromId, to: toId });
    setShowVersionComparison(true);
  };

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-destructive">
          Error loading quote: {error.message}
        </p>
        <Button asChild>
          <Link href="/quotes">Back to Quotes</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !quote) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Helper to check if quote can be edited
  const isDraft = quote.statecode === 0;

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Back Button + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <Link href="/quotes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                QUOTES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {quote.name}
              </h1>
            </div>
          </div>

          {/* RIGHT: Hamburger + Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Navigation Menu */}
            <SidebarTrigger className="h-8 w-8" />

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300 mx-1" />

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isDraft && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/quotes/${id}/edit`} className="flex items-center cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowActivateDialog(true)}>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Activate Quote
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {quote.statecode === 1 && (
                  <>
                    <DropdownMenuItem onClick={() => setShowWinDialog(true)}>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Win Quote
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowLoseDialog(true)}>
                      <FileX className="mr-2 h-4 w-4" />
                      Lose Quote
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleClone} disabled={isCloning}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSaveAsTemplateDialog(true)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Save as Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCancelDialog(true)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{quote.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content - Fondo gris igual que opportunities/accounts */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Quote Info Header + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Quote Info Header & Actions */}
          <div className="hidden md:block px-4 pt-4 pb-4">
            <QuoteInfoHeader
              quote={quote}
              onActivate={() => setShowActivateDialog(true)}
              onWin={() => setShowWinDialog(true)}
              onLose={() => setShowLoseDialog(true)}
              onCancel={() => setShowCancelDialog(true)}
              onRevise={handleRevise}
              onDelete={() => setShowDeleteDialog(true)}
              onClone={handleClone}
              onSaveAsTemplate={() => setShowSaveAsTemplateDialog(true)}
              isCloning={isCloning}
            />
          </div>

          {/* Mobile Layout: Only Info Header (actions in dropdown menu) */}
          <div className="md:hidden px-4 pt-4 pb-4">
            <QuoteInfoHeader
              quote={quote}
              onActivate={() => setShowActivateDialog(true)}
              onWin={() => setShowWinDialog(true)}
              onLose={() => setShowLoseDialog(true)}
              onCancel={() => setShowCancelDialog(true)}
              onRevise={handleRevise}
              onDelete={() => setShowDeleteDialog(true)}
              onClone={handleClone}
              onSaveAsTemplate={() => setShowSaveAsTemplateDialog(true)}
              isCloning={isCloning}
            />
          </div>
          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="quote-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with quote details */}
        <div className="px-4 pb-4 pt-1">
          <QuoteDetailTabs
            quote={quote}
            quoteLines={quoteLines}
            onCompareVersions={handleCompareVersions}
          />
        </div>

        {/* Dialogs */}
        <QuoteActivateDialog
          quote={quote}
          quoteLineCount={quoteLines.length}
          open={showActivateDialog}
          onOpenChange={setShowActivateDialog}
        />

        <QuoteCloseDialog
          quote={quote}
          action="win"
          open={showWinDialog}
          onOpenChange={setShowWinDialog}
        />

        <QuoteCloseDialog
          quote={quote}
          action="lose"
          open={showLoseDialog}
          onOpenChange={setShowLoseDialog}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quote?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{quote.name}"? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Confirmation */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Quote?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel "{quote.name}"? The quote will
                be marked as Canceled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Keep It</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>
                Yes, Cancel Quote
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save as Template Dialog */}
        <SaveAsTemplateDialog
          quote={quote}
          quoteLines={quoteLines}
          open={showSaveAsTemplateDialog}
          onOpenChange={setShowSaveAsTemplateDialog}
        />

        {/* Version Comparison Dialog */}
        {versionComparisonIds && (
          <QuoteVersionComparisonDialog
            open={showVersionComparison}
            onOpenChange={setShowVersionComparison}
            fromVersionId={versionComparisonIds.from}
            toVersionId={versionComparisonIds.to}
          />
        )}
      </div>
    </>
  );
}
