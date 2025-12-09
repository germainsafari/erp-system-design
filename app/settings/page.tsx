"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

interface CompanySettings {
  companyName: string
  email: string
  phone: string
  address: string
}

interface NotificationSettings {
  lowStockAlerts: boolean
  orderNotifications: boolean
  emailReports: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "RetailFlow Inc.",
    email: "contact@retailflow.com",
    phone: "555-0100",
    address: "123 Business Park, New York, NY 10001",
  })
  const [notifications, setNotifications] = useState<NotificationSettings>({
    lowStockAlerts: true,
    orderNotifications: true,
    emailReports: false,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedCompany = localStorage.getItem("companySettings")
    const savedNotifications = localStorage.getItem("notificationSettings")

    if (savedCompany) {
      try {
        setCompanySettings(JSON.parse(savedCompany))
      } catch (e) {
        console.error("Error loading company settings:", e)
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error("Error loading notification settings:", e)
      }
    }
  }, [])

  function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem("companySettings", JSON.stringify(companySettings))
    toast.success("Company settings saved successfully")
  }

  function handleSaveNotifications() {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications))
    toast.success("Notification settings saved successfully")
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    // In a real app, this would call an API to update the password
    // For now, we'll just show a success message
    toast.success("Password updated successfully")
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  return (
    <AppLayout title="Settings" description="Manage your account and application settings">
      <div className="max-w-3xl space-y-6">
        {/* Company Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
            <CardDescription>Update your company details and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts when products fall below minimum stock</p>
              </div>
              <Switch
                checked={notifications.lowStockAlerts}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, lowStockAlerts: checked })
                  handleSaveNotifications()
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about new orders and status changes</p>
              </div>
              <Switch
                checked={notifications.orderNotifications}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, orderNotifications: checked })
                  handleSaveNotifications()
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly financial and inventory reports</p>
              </div>
              <Switch
                checked={notifications.emailReports}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, emailReports: checked })
                  handleSaveNotifications()
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                    toast.error("Account deletion is not implemented in this demo")
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
