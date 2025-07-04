"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Code, Save } from 'lucide-react'
import { Editor } from '@tinymce/tinymce-react'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  description?: string
}

export function HtmlEditor({ 
  value, 
  onChange, 
  placeholder = "Enter HTML content...", 
  className = "",
  disabled = false,
  label,
  description
}: HtmlEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [content, setContent] = useState(value)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setContent(value)
  }, [value])

  const handleEditorChange = (newContent: string) => {
    setContent(newContent)
    onChange(newContent)
  }

  const handleSave = () => {
    onChange(content)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">HTML Editor</CardTitle>
              <CardDescription>Edit HTML content with TinyMCE editor and live preview</CardDescription>
            </div>
            <Button
              onClick={handleSave}
              size="sm"
              className="flex items-center gap-2"
              disabled={disabled}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-4">
              <div className="border rounded-md">
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                  onInit={(evt, editor) => editorRef.current = editor}
                  value={content}
                  init={{
                    height: 400,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'directionality'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | link image | ltr rtl | code | fullscreen | help',
                    content_style: `
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                        font-size: 14px;
                        line-height: 1.6;
                      }
                      body[dir="rtl"] {
                        text-align: right;
                      }
                    `,
                    placeholder: placeholder,
                    directionality: 'auto', // Auto-detect direction
                    setup: (editor: any) => {
                      editor.on('change', () => {
                        const newContent = editor.getContent()
                        handleEditorChange(newContent)
                      })
                      
                      // Add RTL/LTR direction support
                      editor.on('init', () => {
                        // Auto-detect content direction based on first characters
                        const arabicRegex = /[\u0600-\u06FF]/
                        if (arabicRegex.test(content)) {
                          editor.getBody().setAttribute('dir', 'rtl')
                        }
                      })
                    },
                    branding: false,
                    promotion: false,
                    resize: true,
                    statusbar: true,
                    elementpath: false,
                    paste_data_images: true,
                    images_upload_url: '/api/upload', // You can configure this for image uploads
                    automatic_uploads: true,
                    file_picker_types: 'image',
                    paste_as_text: false,
                    smart_paste: true,
                  }}
                  disabled={disabled}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-md p-4 min-h-96 bg-background">
                <div className="prose prose-sm max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: content }}
                    className="w-full"
                    dir="auto"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default HtmlEditor
