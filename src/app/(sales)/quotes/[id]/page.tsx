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
import { useQuotePdfExport } from "@/features/quotes/hooks/use-quote-pdf-export";
import { useAccount } from "@/features/accounts/hooks/use-accounts";
import { useContact } from "@/features/contacts/hooks/use-contacts";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { MobileDetailHeader } from "@/components/layout/mobile-detail-header";
import { useTranslation } from '@/shared/hooks/use-translation';
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

const SendDocumentEmailDialog = dynamic(
  () =>
    import("@/shared/components/send-document-email").then((mod) => ({
      default: mod.SendDocumentEmailDialog,
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
  FileX,
  Mail,
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
  const { t } = useTranslation('quotes');
  const { t: tc } = useTranslation('common');

  const { data: quote, isLoading, error } = useQuote(id);
  const { data: quoteLines = [] } = useQuoteDetails(id);
  const { mutate: deleteQuote } = useDeleteQuote();
  const { mutate: cancelQuote } = useCancelQuote();
  const { mutate: reviseQuote } = useReviseQuote();
  const { mutate: cloneQuote, isPending: isCloning } = useCloneQuote();
  const { generatePdfBlob } = useQuotePdfExport();

  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
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
          {tc('errors.loadFailed', { entity: tc('entities.quote') })}: {error.message}
        </p>
        <Button asChild>
          <Link href="/quotes">{tc('actions.backTo', { entity: tc('breadcrumbs.quotes') })}</Link>
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

  // Resolve customer email
  const isAccountCustomer = quote.customeridtype === 'account';
  const { account } = useAccount(isAccountCustomer ? quote.customerid : '');
  const { contact } = useContact(!isAccountCustomer ? quote.customerid : '');
  const customerEmail = isAccountCustomer ? account?.emailaddress1 : contact?.emailaddress1;
  const customerName = isAccountCustomer ? account?.name : (contact?.fullname || `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim());

  // Mobile actions dropdown
  const mobileActions = (
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
                {tc('buttons.edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowActivateDialog(true)}>
              <FileCheck className="mr-2 h-4 w-4" />
              {tc('actions.activateQuote')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {quote.statecode === 1 && (
          <>
            <DropdownMenuItem onClick={() => setShowWinDialog(true)}>
              <FileCheck className="mr-2 h-4 w-4" />
              {tc('actions.winQuote')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowLoseDialog(true)}>
              <FileX className="mr-2 h-4 w-4" />
              {tc('actions.loseQuote')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => setShowSendEmailDialog(true)}>
          <Mail className="mr-2 h-4 w-4" />
          {tc('actions.sendEmail')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClone} disabled={isCloning}>
          <Copy className="mr-2 h-4 w-4" />
          {tc('actions.cloneQuote')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowSaveAsTemplateDialog(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          {tc('actions.saveAsTemplate')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowCancelDialog(true)}>
          <XCircle className="mr-2 h-4 w-4" />
          {tc('actions.cancelQuote')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {tc('buttons.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/quotes"
        entityType="QUOTES"
        title={quote.name}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: tc('breadcrumbs.sales'), href: '/dashboard' },
          { label: tc('breadcrumbs.quotes'), href: '/quotes' },
          { label: quote.name },
        ]}
      />

      {/* Content - Fondo gris igual que opportunities/accounts */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY SECTION - Quote Info Header + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
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
              onSendEmail={() => setShowSendEmailDialog(true)}
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
              onSendEmail={() => setShowSendEmailDialog(true)}
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

        {/* Send Email Dialog */}
        <SendDocumentEmailDialog
          open={showSendEmailDialog}
          onOpenChange={setShowSendEmailDialog}
          documentType="quote"
          documentId={quote.quoteid}
          documentNumber={quote.quotenumber || quote.quoteid}
          documentName={quote.name}
          customerEmail={customerEmail}
          customerName={customerName}
          totalAmount={quote.totalamount != null ? `$${quote.totalamount.toLocaleString()}` : undefined}
          onGeneratePdf={() => generatePdfBlob(quote.quoteid)}
        />
      </div>
    </>
  );
}
