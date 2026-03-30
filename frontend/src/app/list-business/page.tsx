"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SimpleDirectusService } from "@/lib/directus-simple";
import { CheckCircle2 } from "lucide-react";

export default function ListBusinessPage() {
  const [formData, setFormData] = useState({
    business_name: "",
    contact_person: "",
    phone: "",
    email: "",
    category: "",
    city: "Karachi",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await SimpleDirectusService.createBusinessLead(formData);
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="size-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Registration Received!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your interest in Clyp. Our team will review your business information and contact you within 24-48 hours.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full bg-purple-600 hover:bg-purple-700">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Grow Your Business with Clyp</h1>
          <p className="text-lg text-gray-600">
            Join Pakistan's leading salon marketplace and reach thousands of new customers.
          </p>
        </div>

        <Card className="shadow-xl border-none">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input 
                    required 
                    placeholder="e.g. Elite Grooming Lounge" 
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input 
                    required 
                    placeholder="Full Name" 
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input 
                    required 
                    type="tel" 
                    placeholder="+92 XXX XXXXXXX" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    required 
                    type="email" 
                    placeholder="business@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Category</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Barber">Barber</option>
                    <option value="Hair Salon">Hair Salon</option>
                    <option value="Spa">Spa</option>
                    <option value="Nail Salon">Nail Salon</option>
                    <option value="Beauty Salon">Beauty Salon</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
