"use client";

import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusiness } from "@/context/BusinessContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (r: number) => void;
}) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`cursor-pointer h-6 w-6 ${
          star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        onClick={() => setRating(star)}
      />
    ))}
  </div>
);

export const FeedbackForm = ({
  partnerName,
  conversationId,
  feedbackForm,
  productContext
}: {
  partnerName: string;
  conversationId: string;
  feedbackForm: string;
  productContext: string;
}) => {
  const { businessObject } = useBusiness();
  const [businessRating, setBusinessRating] = useState(0);
  const [productRating, setProductRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(feedbackForm === "completed");
  const [productId, setProductId] = useState(productContext);
  
console.log("productId", productId)

  useEffect(() => {
    setSubmitted(feedbackForm === "completed");
  }, [feedbackForm]);

  useEffect(() => {
    setProductId(productContext);
  }, [productContext]);

  const handleSubmit = async () => {
    if (businessRating === 0) {
      toast.error("Please provide a rating for your experience.");
      return;
    }
    try {
      // Step 1: Post the detailed feedback. This will throw an error if it fails.
      await postFeedback();

      // Step 2: If feedback was posted successfully, update the conversation status.
      await patchConversation();

      // Step 3: If both requests succeed, show success message and update UI.
      toast.success("Thank you for your feedback!");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      toast.error(error.response?.data?.error || "Failed to submit feedback. Please try again.");
    }
  };

  const postFeedback = async () => {
    try {
      const response = await axios.post("/api/feedback", {
        conversationId,
        productId,
        businessRating,
        productRating,
        comment,
      });
      if (response.status == 200 ){
        setBusinessRating(0);
        setProductRating(0);
        setComment("");
      }
    } catch (error: any) {
      console.error("Failed to save rating", error);
    }
  };

  const patchConversation = async () => {
    try {
      await axios.patch(`/api/chat?conversationId=${conversationId}`, {
        productContext: "",
        feedbackForm: "completed",
        // You can add fields for ratings and comments here if your model supports them
      });
      toast.success("Thank you for your feedback!");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Failed to submit ratings:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800">Feedback Submitted!</h3>
        <p className="text-sm text-green-700">
          Thank you for helping us improve.
        </p>
      </div>
    );
  }

  return (
    <Card className="mt-4 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-base">Leave Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Rate your experience with {partnerName}
          </label>
          <StarRating rating={businessRating} setRating={setBusinessRating} />
        </div>

        {businessObject?.role === "importer" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate the product</label>
            <StarRating rating={productRating} setRating={setProductRating} />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Comments</label>
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-rose-500 hover:bg-rose-600"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
};
