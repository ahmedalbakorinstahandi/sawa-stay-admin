"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Save, Eye, EyeOff, Loader2, Search, Filter, Edit2, Trash2, Plus, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Editor } from '@tinymce/tinymce-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { settingsAPI } from '@/lib/api'

interface Setting {
  id: number
  key: string
  value: string
  type: 'int' | 'float' | 'text' | 'long_text' | 'list' | 'json' | 'image' | 'file' | 'bool' | 'time' | 'date' | 'datetime' | 'html'
  allow_null: boolean
  is_settings: boolean
}

interface SettingsResponse {
  success: boolean
  data: Setting[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({})
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: string }>({})
  const [selectedSettings, setSelectedSettings] = useState<number[]>([])
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingSetting, setDeletingSetting] = useState<Setting | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newSetting, setNewSetting] = useState<Partial<Setting>>({
    key: '',
    value: '',
    type: 'text',
    allow_null: false,
    is_settings: true
  })
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const { toast } = useToast()

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await settingsAPI.getAll()

      if (data.success) {
        setSettings(data.data)
        // Initialize editing state
        const initialEditingState: { [key: string]: string } = {}
        data.data.forEach((setting: Setting) => {
          initialEditingState[setting.key] = setting.value
        })
        setEditingSettings(initialEditingState)
      } else {
        throw new Error(data.message || 'Failed to fetch settings')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings'
      setError(errorMessage)
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Save single setting
  const saveSetting = async (setting: Setting) => {
    try {
      setSaving(true)

      const data = await settingsAPI.update(setting.id, editingSettings[setting.key])

      if (data.success) {
        // Update settings state
        setSettings(prevSettings =>
          prevSettings.map(s =>
            s.id === setting.id
              ? { ...s, value: editingSettings[setting.key] }
              : s
          )
        )

        toast({
          title: "تم الحفظ",
          description: "تم حفظ الإعداد بنجاح",
        })
      } else {
        throw new Error(data.message || 'Failed to save setting')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save setting'
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Save multiple settings
  const saveMultipleSettings = async (settingsToSave: Setting[]) => {
    try {
      setSaving(true)

      const settingsData = settingsToSave.map(setting => ({
        key: setting.key,
        value: editingSettings[setting.key]
      }))

      const data = await settingsAPI.updateMultiple(settingsData)

      if (data.success) {
        // Update settings state
        setSettings(prevSettings =>
          prevSettings.map(s => {
            const updatedValue = editingSettings[s.key]
            return settingsToSave.some(setting => setting.key === s.key)
              ? { ...s, value: updatedValue }
              : s
          })
        )

        toast({
          title: "تم الحفظ",
          description: `تم حفظ ${settingsToSave.length} إعداد بنجاح`,
        })
      } else {
        throw new Error(data.message || 'Failed to save settings')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Create new setting
  const createSetting = async () => {
    try {
      setSaving(true)

      const data = await settingsAPI.create({
        key: newSetting.key || '',
        value: newSetting.value || '',
        type: newSetting.type || 'text',
        allow_null: newSetting.allow_null || false,
        is_settings: newSetting.is_settings || true
      })

      if (data.success) {
        // Add new setting to the list
        setSettings(prevSettings => [...prevSettings, data.data])
        setEditingSettings(prev => ({
          ...prev,
          [data.data.key]: data.data.value
        }))

        // Reset form
        setNewSetting({
          key: '',
          value: '',
          type: 'text',
          allow_null: false,
          is_settings: true
        })

        setShowAddDialog(false)

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء الإعداد الجديد بنجاح",
        })
      } else {
        throw new Error(data.message || 'Failed to create setting')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create setting'
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete setting
  const deleteSetting = async (setting: Setting) => {
    try {
      const data = await settingsAPI.delete(setting.id)

      if (data.success) {
        setSettings(prevSettings => prevSettings.filter(s => s.id !== setting.id))
        toast({
          title: "تم الحذف",
          description: "تم حذف الإعداد بنجاح",
        })
      } else {
        throw new Error(data.message || 'Failed to delete setting')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete setting'
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Delete multiple settings
  const deleteMultipleSettings = async (settingIds: number[]) => {
    try {
      const deletePromises = settingIds.map(id => settingsAPI.delete(id))
      const results = await Promise.all(deletePromises)

      if (results.every(result => result.success)) {
        setSettings(prevSettings =>
          prevSettings.filter(s => !settingIds.includes(s.id))
        )
        setSelectedSettings([])
        toast({
          title: "تم الحذف",
          description: `تم حذف ${settingIds.length} إعداد بنجاح`,
        })
      } else {
        throw new Error('Failed to delete some settings')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete settings'
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || setting.type === typeFilter
    return matchesSearch && matchesType
  })

  // Group settings by category (based on key prefix)
  const groupedSettings = filteredSettings.reduce((groups, setting) => {
    const parts = setting.key.split('.')
    const category = parts.length > 1 ? parts[0] : 'general'

    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(setting)
    return groups
  }, {} as Record<string, Setting[]>)

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'general': 'عام',
      'app': 'التطبيق',
      'social_media': 'وسائل التواصل',
      'about': 'حول',
      'terms': 'الشروط والأحكام',
      'privacy': 'الخصوصية',
      'help': 'المساعدة',
      'contact': 'التواصل',
      'payment': 'الدفع',
      'booking': 'الحجز',
      'host': 'المضيف',
      'guest': 'الضيف'
    }
    return categoryNames[category] || category
  }

  const toggleShowValue = (key: string) => {
    setShowValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleInputChange = (key: string, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTinyMCEChange = (content: string, key: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: content
    }))
  }

  const handleSelectSetting = (settingId: number) => {
    setSelectedSettings(prev =>
      prev.includes(settingId)
        ? prev.filter(id => id !== settingId)
        : [...prev, settingId]
    )
  }

  const handleSelectAllSettings = () => {
    if (selectedSettings.length === filteredSettings.length) {
      setSelectedSettings([])
    } else {
      setSelectedSettings(filteredSettings.map(s => s.id))
    }
  }

  const saveSelectedSettings = () => {
    const settingsToSave = settings.filter(s => selectedSettings.includes(s.id))
    saveMultipleSettings(settingsToSave)
  }

  const renderSettingInput = (setting: Setting) => {
    const currentValue = editingSettings[setting.key] || ''
    const isValueVisible = showValues[setting.key]

    if (setting.type === 'html') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة</Label>
          <div className="settings-editor">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'}
              value={currentValue}
              onEditorChange={(content) => handleTinyMCEChange(content, setting.key)}
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount', 'directionality'
                ],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | ltr rtl | help',
                content_style: 'body { font-family: "Tajawal", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; direction: rtl; text-align: right; }',
                directionality: 'rtl',
                language: 'ar',
                skin: 'oxide',
                content_css: 'default',
                body_class: 'mce-content-body',
                setup: function (editor: any) {
                  editor.on('init', function () {
                    editor.getDoc().documentElement.setAttribute('dir', 'rtl');
                  });
                }
              }}
            />
          </div>
        </div>
      )
    }

    if (setting.type === 'long_text') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة</Label>
          <textarea
            id={setting.key}
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="أدخل النص الطويل..."
          />
        </div>
      )
    }

    if (setting.type === 'json') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة (JSON)</Label>
          <textarea
            id={setting.key}
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            placeholder='{"key": "value"}'
          />
        </div>
      )
    }

    if (setting.type === 'list') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة (قائمة - كل عنصر في سطر)</Label>
          <textarea
            id={setting.key}
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="عنصر 1&#10;عنصر 2&#10;عنصر 3"
          />
        </div>
      )
    }

    if (setting.type === 'bool') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={setting.key}
              checked={currentValue === 'true' || currentValue === '1'}
              onCheckedChange={(checked) =>
                handleInputChange(setting.key, checked ? 'true' : 'false')
              }
            />
            <Label htmlFor={setting.key} className="text-sm">
              {currentValue === 'true' || currentValue === '1' ? 'مفعل' : 'معطل'}
            </Label>
          </div>
        </div>
      )
    }

    if (setting.type === 'image' || setting.type === 'file') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة ({setting.type === 'image' ? 'رابط الصورة' : 'رابط الملف'})</Label>
          <div className="relative">
            <Input
              id={setting.key}
              type="url"
              value={currentValue}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              placeholder={setting.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/file.pdf'}
            />
          </div>
          {currentValue && setting.type === 'image' && (
            <div className="mt-2">
              <img src={currentValue} alt="Preview" className="max-w-xs max-h-40 rounded-md border" />
            </div>
          )}
        </div>
      )
    }

    if (setting.type === 'date') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة</Label>
          <Input
            id={setting.key}
            type="date"
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
          />
        </div>
      )
    }

    if (setting.type === 'time') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة</Label>
          <Input
            id={setting.key}
            type="time"
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
          />
        </div>
      )
    }

    if (setting.type === 'datetime') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key}>القيمة</Label>
          <Input
            id={setting.key}
            type="datetime-local"
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
          />
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={setting.key}>القيمة</Label>
        <div className="relative">
          <Input
            id={setting.key}
            type={setting.type === 'float' || setting.type === 'int' ? 'number' : 'text'}
            value={currentValue}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            // className="pr-10"
            step={setting.type === 'float' ? '0.01' : '1'}
            min={setting.type === 'float' || setting.type === 'int' ? '0' : undefined}
          />
          {/* <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => toggleShowValue(setting.key)}
          > */}
            {/* {isValueVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )} */}
          {/* </Button> */}
        </div>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800'
      case 'long_text': return 'bg-indigo-100 text-indigo-800'
      case 'html': return 'bg-green-100 text-green-800'
      case 'float': return 'bg-yellow-100 text-yellow-800'
      case 'int': return 'bg-purple-100 text-purple-800'
      case 'bool': return 'bg-red-100 text-red-800'
      case 'json': return 'bg-orange-100 text-orange-800'
      case 'list': return 'bg-teal-100 text-teal-800'
      case 'image': return 'bg-pink-100 text-pink-800'
      case 'file': return 'bg-cyan-100 text-cyan-800'
      case 'date': return 'bg-emerald-100 text-emerald-800'
      case 'time': return 'bg-violet-100 text-violet-800'
      case 'datetime': return 'bg-rose-100 text-rose-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className=" space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإعدادات</h1>
          <p className="text-muted-foreground">
            إدارة وتعديل إعدادات النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة إعداد جديد
          </Button> */}
          <Button
            variant="outline"
            onClick={() => fetchSettings()}
            disabled={loading}
          >
            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          {selectedSettings.length > 0 && (
            <>
              <Button
                onClick={saveSelectedSettings}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Save className="h-4 w-4 mr-2" />
                حفظ المحدد ({selectedSettings.length})
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف المحدد ({selectedSettings.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الإعدادات
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.length}</div>
            <p className="text-xs text-muted-foreground">
              جميع الإعدادات المسجلة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إعدادات HTML
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">HTML</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.filter(s => s.type === 'html').length}
            </div>
            <p className="text-xs text-muted-foreground">
              صفحات ومحتوى
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إعدادات النص
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-800">TEXT</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.filter(s => s.type === 'text').length}
            </div>
            <p className="text-xs text-muted-foreground">
              نصوص وروابط
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إعدادات رقمية
            </CardTitle>
            <Badge className="bg-purple-100 text-purple-800">NUM</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.filter(s => s.type === 'float' || s.type === 'int').length}
            </div>
            <p className="text-xs text-muted-foreground">
              أرقام وقيم
            </p>
          </CardContent>
        </Card>
      </div> */}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="list">قائمة الإعدادات</TabsTrigger>
          {/* <TabsTrigger value="bulk">التحرير الجماعي</TabsTrigger> */}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الإعدادات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>                <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="text">نص</SelectItem>
                <SelectItem value="long_text">نص طويل</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="int">عدد صحيح</SelectItem>
                <SelectItem value="float">عدد عشري</SelectItem>
                <SelectItem value="bool">منطقي</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="list">قائمة</SelectItem>
                <SelectItem value="image">صورة</SelectItem>
                <SelectItem value="file">ملف</SelectItem>
                <SelectItem value="date">تاريخ</SelectItem>
                <SelectItem value="time">وقت</SelectItem>
                <SelectItem value="datetime">تاريخ ووقت</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getCategoryName(category)}
                  </h3>
                  <Badge variant="secondary">
                    {categorySettings.length} إعداد
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {categorySettings.map((setting) => (
                    <Card key={setting.id} className="relative setting-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedSettings.includes(setting.id)}
                              onCheckedChange={() => handleSelectSetting(setting.id)}
                            />
                            <div>
                              <CardTitle className="text-lg">{setting.key}</CardTitle>
                              <CardDescription>
                                المعرف: {setting.id}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(setting.type)}>
                              {setting.type}
                            </Badge>
                            {!setting.allow_null && (
                              <Badge variant="outline">مطلوب</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSetting(setting)
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingSetting(setting)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button> */}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {renderSettingInput(setting)}
                        <div className="flex justify-end">
                          <Button
                            onClick={() => saveSetting(setting)}
                            disabled={saving}
                            size="sm"
                          >
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            <Save className="h-4 w-4 mr-2" />
                            حفظ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedSettings).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  لا توجد إعدادات
                </h3>
                <p className="text-muted-foreground mb-4">
                  لا توجد إعدادات تطابق البحث المحدد
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة إعداد جديد
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التحرير الجماعي</CardTitle>
              <CardDescription>
                حدد الإعدادات التي تريد تحريرها جماعياً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSettings.length === filteredSettings.length}
                    onCheckedChange={handleSelectAllSettings}
                  />
                  <Label>تحديد الكل</Label>
                </div>
                <Separator />
                <div className="space-y-2">
                  {filteredSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedSettings.includes(setting.id)}
                        onCheckedChange={() => handleSelectSetting(setting.id)}
                      />
                      <Label className="flex-1">{setting.key}</Label>
                      <Badge className={getTypeColor(setting.type)}>
                        {setting.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New Setting Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة إعداد جديد</DialogTitle>
            <DialogDescription>
              إنشاء إعداد جديد في النظام
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-key">المفتاح</Label>
                <Input
                  id="new-key"
                  placeholder="مثال: app.name"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-type">النوع</Label>
                <Select
                  value={newSetting.type}
                  onValueChange={(value) => setNewSetting(prev => ({ ...prev, type: value as Setting['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">نص</SelectItem>
                    <SelectItem value="long_text">نص طويل</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="int">عدد صحيح</SelectItem>
                    <SelectItem value="float">عدد عشري</SelectItem>
                    <SelectItem value="bool">منطقي</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="list">قائمة</SelectItem>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="file">ملف</SelectItem>
                    <SelectItem value="date">تاريخ</SelectItem>
                    <SelectItem value="time">وقت</SelectItem>
                    <SelectItem value="datetime">تاريخ ووقت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-allow-null"
                  checked={newSetting.allow_null}
                  onCheckedChange={(checked) => setNewSetting(prev => ({ ...prev, allow_null: checked as boolean }))}
                />
                <Label htmlFor="new-allow-null">السماح بالقيم الفارغة</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-value">القيمة</Label>
              {newSetting.type === 'html' ? (
                <div className="settings-editor">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'}
                    value={newSetting.value}
                    onEditorChange={(content) => setNewSetting(prev => ({ ...prev, value: content }))}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'directionality'
                      ],
                      toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | ltr rtl | help',
                      content_style: 'body { font-family: "Tajawal", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; direction: rtl; text-align: right; }',
                      directionality: 'rtl',
                      language: 'ar',
                      skin: 'oxide',
                      content_css: 'default',
                      body_class: 'mce-content-body',
                      setup: function (editor: any) {
                        editor.on('init', function () {
                          editor.getDoc().documentElement.setAttribute('dir', 'rtl');
                        });
                      }
                    }}
                  />
                </div>
              ) : newSetting.type === 'long_text' ? (
                <textarea
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="أدخل النص الطويل..."
                />
              ) : newSetting.type === 'json' ? (
                <textarea
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  placeholder='{"key": "value"}'
                />
              ) : newSetting.type === 'list' ? (
                <textarea
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="عنصر 1&#10;عنصر 2&#10;عنصر 3"
                />
              ) : newSetting.type === 'bool' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-boolean-value"
                    checked={newSetting.value === 'true' || newSetting.value === '1'}
                    onCheckedChange={(checked) => setNewSetting(prev => ({ ...prev, value: checked ? 'true' : 'false' }))}
                  />
                  <Label htmlFor="new-boolean-value">
                    {newSetting.value === 'true' || newSetting.value === '1' ? 'مفعل' : 'معطل'}
                  </Label>
                </div>
              ) : newSetting.type === 'date' ? (
                <Input
                  type="date"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                />
              ) : newSetting.type === 'time' ? (
                <Input
                  type="time"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                />
              ) : newSetting.type === 'datetime' ? (
                <Input
                  type="datetime-local"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                />
              ) : newSetting.type === 'image' || newSetting.type === 'file' ? (
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder={newSetting.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/file.pdf'}
                    value={newSetting.value}
                    onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  />
                  {newSetting.value && newSetting.type === 'image' && (
                    <img src={newSetting.value} alt="Preview" className="max-w-xs max-h-40 rounded-md border" />
                  )}
                </div>
              ) : (
                <Input
                  id="new-value"
                  type={newSetting.type === 'float' || newSetting.type === 'int' ? 'number' : 'text'}
                  placeholder="أدخل القيمة"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  step={newSetting.type === 'float' ? '0.01' : '1'}
                  min={newSetting.type === 'float' || newSetting.type === 'int' ? '0' : undefined}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={createSetting}
              disabled={saving || !newSetting.key || !newSetting.value}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الإعداد</DialogTitle>
            <DialogDescription>
              تعديل قيمة الإعداد: {editingSetting?.key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingSetting && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المعرف</Label>
                    <Input value={editingSetting.id} disabled />
                  </div>
                  <div>
                    <Label>المفتاح</Label>
                    <Input value={editingSetting.key} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>النوع</Label>
                    <Input value={editingSetting.type} disabled />
                  </div>
                  <div>
                    <Label>يسمح بالقيم الفارغة</Label>
                    <Input value={editingSetting.allow_null ? 'نعم' : 'لا'} disabled />
                  </div>
                </div>
                {renderSettingInput(editingSetting)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (editingSetting) {
                  saveSetting(editingSetting)
                  setShowEditDialog(false)
                }
              }}
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الإعداد "{deletingSetting?.key}"؟
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingSetting) {
                  deleteSetting(deletingSetting)
                  setShowDeleteDialog(false)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف الجماعي</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {selectedSettings.length} إعداد؟
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMultipleSettings(selectedSettings)
                setShowBulkDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
