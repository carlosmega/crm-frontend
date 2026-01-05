import { Lock, Info, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface DisabledStageTabProps {
  stageName: string
  description?: string
  fieldPreview?: string[]
  requiresConversion?: boolean
}

/**
 * DisabledStageTab
 *
 * Displayed for BPF stages that are not yet accessible.
 * For Leads, stages Develop/Propose/Close require conversion to Opportunity.
 *
 * Shows:
 * - Lock icon and message explaining why it's disabled
 * - Preview of fields that will be available
 * - Instructions for how to unlock
 */
export function DisabledStageTab({
  stageName,
  description,
  fieldPreview,
  requiresConversion = true,
}: DisabledStageTabProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
      {/* Lock Icon */}
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
        <Lock className="w-10 h-10 text-muted-foreground" />
      </div>

      {/* Main Message */}
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          {stageName} Stage Not Available
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Conversion Alert */}
      {requiresConversion && (
        <Alert className="max-w-lg">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            To access the <strong>{stageName}</strong> stage, you must first complete the{' '}
            <strong>Qualify</strong> stage and convert this lead to an{' '}
            <strong>Opportunity</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Field Preview */}
      {fieldPreview && fieldPreview.length > 0 && (
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
            Fields available after unlocking:
          </div>
          <div className="flex flex-wrap gap-2">
            {fieldPreview.map((field) => (
              <Badge key={field} variant="outline" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {requiresConversion && (
        <div className="mt-8 p-4 rounded-lg border border-border bg-muted/30 max-w-lg">
          <h4 className="text-sm font-semibold mb-2">How to unlock this stage:</h4>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Complete all required fields in the <strong>Qualify</strong> tab</li>
            <li>Click <strong>"Qualify Lead"</strong> button in the lead actions</li>
            <li>System will create an <strong>Opportunity</strong> record</li>
            <li>Continue with <strong>{stageName}</strong> stage in the Opportunity</li>
          </ol>
        </div>
      )}
    </div>
  )
}
