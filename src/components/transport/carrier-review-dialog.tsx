"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Alert, Button, Dialog, Textarea } from "@/components/ui";
import type { CarrierReviewSummary } from "@/modules/transport/schemas";

export interface CarrierReviewDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  transporterName?: string;
  onSuccess?: (review: CarrierReviewSummary) => void;
}

export function CarrierReviewDialog({
  open,
  onClose,
  orderId,
  orderCode,
  transporterName,
  onSuccess,
}: CarrierReviewDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [timelinessScore, setTimelinessScore] = useState<number>(5);
  const [cargoCareScore, setCargoCareScore] = useState<number>(5);
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/transport/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          rating,
          timelinessScore,
          cargoCareScore,
          communicationScore,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error?.message || "Failed to submit review");
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(data.data.review);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderInteractiveStars(
    value: number,
    onChange: (val: number) => void,
    hoverVal?: number,
    onHover?: (val: number) => void,
    onLeave?: () => void,
  ) {
    const activeVal = hoverVal && hoverVal > 0 ? hoverVal : value;
    return (
      <div className="flex items-center gap-1.5" role="radiogroup">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onLeave && onLeave()}
            className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= activeVal
                  ? "fill-amber-400 text-amber-500"
                  : "text-gray-300 stroke-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  function renderScoreSelector(
    label: string,
    description: string,
    score: number,
    onSelect: (val: number) => void,
  ) {
    return (
      <div className="space-y-1.5 p-3 rounded-lg border border-gray-200 bg-gray-50/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900">{label}</span>
          <span className="text-xs font-extrabold text-green-800">{score}/5</span>
        </div>
        <p className="text-[11px] text-gray-500">{description}</p>
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onSelect(star)}
              className={`px-3 py-1.5 text-xs font-bold rounded min-h-[36px] transition-colors ${
                star === score
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              ★ {star}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Rate Carrier Haulage Service"
      description={`Order ${orderCode} • Carrier: ${transporterName || "Assigned Transporter"}`}
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto animate-bounce" />
          <h3 className="text-base font-extrabold text-gray-900">
            Carrier Review Submitted!
          </h3>
          <p className="text-xs text-gray-600">
            Thank you for contributing verified feedback to Benue agricultural transport.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {errorMessage && (
            <Alert tone="error" title={errorMessage} className="text-xs" />
          )}

          {/* Primary Star Rating */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-center space-y-2">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
              Overall Carrier Rating
            </span>
            <div className="flex justify-center">
              {renderInteractiveStars(
                rating,
                setRating,
                hoverRating,
                setHoverRating,
                () => setHoverRating(0),
              )}
            </div>
            <p className="text-xs text-amber-900 font-semibold">
              {rating === 5 && "Excellent (Prompt, careful & reliable)"}
              {rating === 4 && "Very Good (Smooth corridor delivery)"}
              {rating === 3 && "Satisfactory (Acceptable standard)"}
              {rating === 2 && "Needs Improvement (Minor issues encountered)"}
              {rating === 1 && "Poor (Major delays or cargo mishandling)"}
            </p>
          </div>

          {/* Sub-Score Badges */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Performance Indicators
            </h4>

            {renderScoreSelector(
              "Timeliness & Punctuality",
              "Arrived on schedule for farm-gate loading and delivered promptly.",
              timelinessScore,
              setTimelinessScore,
            )}

            {renderScoreSelector(
              "Cargo Care & Packaging Preservation",
              "Tarp protection, secure strapping, zero spillage or crushing.",
              cargoCareScore,
              setCargoCareScore,
            )}

            {renderScoreSelector(
              "Communication & Corridor Updates",
              "Proactive transit check-ins and professional coordination.",
              communicationScore,
              setCommunicationScore,
            )}
          </div>

          {/* Optional Remarks Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="carrier-review-comment"
                className="text-xs font-bold text-gray-700"
              >
                Review Remarks (Optional)
              </label>
              <span className="text-[11px] text-gray-500">
                {comment.length}/500
              </span>
            </div>
            <Textarea
              id="carrier-review-comment"
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide specific notes regarding vehicle condition, driver professionalism, or loading assistance..."
              className="w-full text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-h-[44px] px-6"
            >
              {isSubmitting ? "Submitting..." : "Submit Carrier Review"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
