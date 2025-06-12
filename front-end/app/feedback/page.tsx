"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Star,
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  ThumbsUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("");
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  // Mock previous feedback
  const previousFeedback = [
    {
      id: 1,
      type: "suggestion",
      subject: "Improve chat translation speed",
      content:
        "The translation feature is great but could be faster for real-time conversations.",
      rating: 4,
      date: "2024-01-20",
      status: "under_review",
      response: null,
    },
    {
      id: 2,
      type: "bug",
      subject: "Product images not loading on mobile",
      content:
        "When browsing products on mobile, images take too long to load or don't load at all.",
      rating: 2,
      date: "2024-01-18",
      status: "addressed",
      response:
        "Thank you for reporting this issue. We've fixed the mobile image loading problem in our latest update.",
    },
    {
      id: 3,
      type: "rating",
      subject: "Excellent platform overall",
      content:
        "Really impressed with the quality of suppliers and the verification process. Keep up the great work!",
      rating: 5,
      date: "2024-01-15",
      status: "acknowledged",
      response:
        "Thank you for your positive feedback! We're glad you're having a great experience.",
    },
  ];

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback = {
      type: feedbackType,
      rating,
      subject,
      content,
      category,
      timestamp: new Date().toISOString(),
    };
    console.log("Submitting feedback:", feedback);
    // Reset form
    setFeedbackType("");
    setRating(0);
    setSubject("");
    setContent("");
    setCategory("");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-600" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case "rating":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case "addressed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Addressed
          </Badge>
        );
      case "acknowledged":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acknowledged
          </Badge>
        );
      default:
        return <Badge variant="secondary">New</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Feedback & Support
            </h1>
            <p className="text-slate-600">
              Help us improve your experience on Sino-Indo Apparel Matcher
            </p>
          </div>
          <Badge className="bg-purple-100 text-purple-800">
            <MessageSquare className="h-3 w-3 mr-1" />
            Your Voice Matters
          </Badge>
        </div>
      </header>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>
                Share your thoughts, report bugs, or suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                {/* Feedback Type */}
                <div className="space-y-3">
                  <Label>Feedback Type</Label>
                  <RadioGroup
                    value={feedbackType}
                    onValueChange={setFeedbackType}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="bug" id="bug" />
                      <Bug className="h-5 w-5 text-red-600" />
                      <div>
                        <Label
                          htmlFor="bug"
                          className="font-medium cursor-pointer"
                        >
                          Bug Report
                        </Label>
                        <p className="text-sm text-slate-600">
                          Report a technical issue or problem
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="suggestion" id="suggestion" />
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <div>
                        <Label
                          htmlFor="suggestion"
                          className="font-medium cursor-pointer"
                        >
                          Suggestion
                        </Label>
                        <p className="text-sm text-slate-600">
                          Suggest a new feature or improvement
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="rating" id="rating" />
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <div>
                        <Label
                          htmlFor="rating"
                          className="font-medium cursor-pointer"
                        >
                          General Feedback
                        </Label>
                        <p className="text-sm text-slate-600">
                          Share your overall experience
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Overall Rating (1-5 stars)</Label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 rounded transition-colors ${
                          star <= rating
                            ? "text-yellow-400"
                            : "text-slate-300 hover:text-yellow-300"
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    {rating === 0 && "Click to rate your experience"}
                    {rating === 1 && "Poor - Needs significant improvement"}
                    {rating === 2 && "Fair - Some issues to address"}
                    {rating === 3 && "Good - Generally satisfied"}
                    {rating === 4 && "Very Good - Minor improvements needed"}
                    {rating === 5 && "Excellent - Exceeds expectations"}
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat & Communication</SelectItem>
                      <SelectItem value="search">Search & Discovery</SelectItem>
                      <SelectItem value="products">
                        Product Management
                      </SelectItem>
                      <SelectItem value="profile">
                        Profile & Verification
                      </SelectItem>
                      <SelectItem value="mobile">Mobile Experience</SelectItem>
                      <SelectItem value="performance">
                        Performance & Speed
                      </SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your feedback"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Details</Label>
                  <Textarea
                    id="content"
                    placeholder="Please provide detailed information about your feedback..."
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <p className="text-sm text-slate-500">
                    Be as specific as possible to help us understand and address
                    your feedback.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={
                    !feedbackType || !subject || !content || rating === 0
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Your Previous Feedback</CardTitle>
              <CardDescription>
                Track the status of your submitted feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(feedback.type)}
                        <h3 className="font-medium text-slate-800">
                          {feedback.subject}
                        </h3>
                      </div>
                      {getStatusBadge(feedback.status)}
                    </div>

                    <p className="text-sm text-slate-600">{feedback.content}</p>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-4">
                        <span>Submitted: {feedback.date}</span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <span>{feedback.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    {feedback.response && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium text-emerald-800 mb-1">
                          Admin Response:
                        </p>
                        <p className="text-sm text-emerald-700">
                          {feedback.response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {previousFeedback.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">
                      No feedback submitted yet
                    </h3>
                    <p className="text-slate-600">
                      Your submitted feedback will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Feedback Guidelines</CardTitle>
            <CardDescription>
              Help us help you better with these tips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Bug className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium">Bug Reports</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Describe what you were trying to do</li>
                  <li>• Include steps to reproduce the issue</li>
                  <li>• Mention your device and browser</li>
                  <li>• Attach screenshots if helpful</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-medium">Suggestions</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Explain the problem you're trying to solve</li>
                  <li>• Describe your proposed solution</li>
                  <li>• Explain how it would benefit users</li>
                  <li>• Consider implementation complexity</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">General Feedback</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Share your overall experience</li>
                  <li>• Mention what you like most</li>
                  <li>• Suggest areas for improvement</li>
                  <li>• Compare with other platforms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
