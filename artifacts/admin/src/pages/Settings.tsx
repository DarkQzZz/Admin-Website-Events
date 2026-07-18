import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { useToast } from '@/hooks/use-toast'
import { Save, Globe, MessageSquare, Image as ImageIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Record<string, string>>({
    site_name: '',
    site_description: '',
    max_upload_size: '5',
    discord_url: '',
    twitter_url: '',
    instagram_url: ''
  })

  // Initialize form when data loads
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }))
    }
  }, [settings])

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData)
      toast({ title: "Settings saved", description: "Your platform configuration has been updated." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full max-w-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform behavior.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Platform Details</CardTitle>
          <CardDescription>Public-facing information about the community.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input id="site_name" value={formData.site_name || ''} onChange={(e) => handleChange('site_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_description">Description (SEO)</Label>
            <Textarea id="site_description" value={formData.site_description || ''} onChange={(e) => handleChange('site_description', e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Upload Limits</CardTitle>
          <CardDescription>Constraints for user artwork submissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Max Upload Size (MB)</Label>
              <span className="font-medium">{formData.max_upload_size || 5} MB</span>
            </div>
            <Slider 
              value={[parseInt(formData.max_upload_size || '5')]} 
              min={1} 
              max={20} 
              step={1}
              onValueChange={(vals) => handleChange('max_upload_size', vals[0].toString())}
            />
            <p className="text-xs text-muted-foreground">Larger limits will consume Supabase storage faster.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Social Links</CardTitle>
          <CardDescription>Connect your community across platforms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="discord_url">Discord Server URL</Label>
            <Input id="discord_url" placeholder="https://discord.gg/..." value={formData.discord_url || ''} onChange={(e) => handleChange('discord_url', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter_url">X (Twitter) URL</Label>
            <Input id="twitter_url" placeholder="https://x.com/..." value={formData.twitter_url || ''} onChange={(e) => handleChange('twitter_url', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" placeholder="https://instagram.com/..." value={formData.instagram_url || ''} onChange={(e) => handleChange('instagram_url', e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 flex justify-end py-4 rounded-b-xl border-t mt-6">
          <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2 px-6">
            <Save className="h-4 w-4" /> 
            {updateSettings.isPending ? 'Saving...' : 'Save All Settings'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Discord OAuth is managed via Supabase UI normally, showing a readonly hint here */}
      <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-300 text-sm">Discord Authentication</CardTitle>
          <CardDescription className="text-blue-600/80 dark:text-blue-300/80">
            Discord OAuth is configured directly in your Supabase Dashboard under Authentication {'>'} Providers.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
