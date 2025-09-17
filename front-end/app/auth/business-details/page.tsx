"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import axios from 'axios';

export default function BusinessDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "importer"

  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    registrationNumber: "",
    country: "",
    address: "",
    contactPerson: "",
    phoneNumber: "",
    website: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save the business details here
    try {
      const response = await axios.post('/api/users/business-details', formData)
      console.log("Businsess registration success", response.data)
      router.push(`/auth/license-upload`)
    } catch (error: any) {
      console.log("Business registration failed", error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link href="/auth" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to authentication</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Company Information</CardTitle>
            <CardDescription>
              This information will be used to verify your business and will be visible to potential partners.
            </CardDescription>
          </CardHeader>
          <CardContent>

        

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
{/**
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleSelectChange("businessType", value)}
                    required
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">Limited Liability Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="soleProprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Business Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                    required
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="indonesia">Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                {/** Contact Person Name
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person Name *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>*/}
{/**
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div> */}
{/**
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input id="website" name="website" value={formData.website} onChange={handleChange} />
                </div> */}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={
                      role === "importer"
                        ? "Describe your business, what products you import, typical order volumes, etc."
                        : "Describe your manufacturing capabilities, specialties, production capacity, etc."
                    }
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="gap-2">
                  Continue to License Upload <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
 {/**         <CardFooter className="text-sm text-muted-foreground">
            <p>
              All fields marked with * are required. Your business information will be verified before you can connect
              with partners.
            </p>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  )
}
