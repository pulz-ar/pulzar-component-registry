import React from "react"
import { X, Loader2, FileText, FileSpreadsheet, File as FileGeneric, FileImage, FileAudio, FileVideo, FileArchive } from "lucide-react"

export type PromptAttachment = {
  id: string
  name: string
  size?: string
  previewURL?: string
  url?: string
  type?: string
  status: "uploading" | "done" | "error"
}

function formatSize(bytes?: number): string | undefined {
  if (!bytes && bytes !== 0) { return undefined }
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const value = (bytes / Math.pow(k, i)).toFixed(1)
  return `${value} ${sizes[i]}`
}

export function PromptFileChip({ file, onRemove }: { file: PromptAttachment; onRemove?: (id: string) => void }) {
  function getIcon() {
    const name = (file.name || "").toLowerCase()
    const ext = name.split(".").pop() || ""
    const type = (file.type || "").toLowerCase()

    if (type.startsWith("image/") || ["png","jpg","jpeg","gif","webp","svg"].includes(ext)) {
      return <FileImage className="h-4 w-4 text-blue-500" />
    }
    if (type.startsWith("audio/") || ["mp3","wav","m4a","ogg"].includes(ext)) {
      return <FileAudio className="h-4 w-4 text-purple-500" />
    }
    if (type.startsWith("video/") || ["mp4","mov","webm","mkv"].includes(ext)) {
      return <FileVideo className="h-4 w-4 text-indigo-500" />
    }
    if (ext === "pdf" || type === "application/pdf") {
      return <FileText className="h-4 w-4 text-red-500" />
    }
    if (["xlsx","xls","csv"].includes(ext) || type.includes("spreadsheet") || type === "text/csv") {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />
    }
    if (["doc","docx"].includes(ext)) {
      return <FileText className="h-4 w-4 text-blue-600" />
    }
    if (["zip","rar","7z","tar","gz"].includes(ext)) {
      return <FileArchive className="h-4 w-4 text-amber-600" />
    }
    return <FileGeneric className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className={["inline-flex items-center gap-2 max-w-full px-2 py-1 mr-2 rounded-md border bg-muted/40 text-foreground"].join(" ")}> 
      {file.status === "uploading" ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : getIcon()}
      <span className="text-xs truncate max-w-[160px] text-foreground" title={file.name}>{file.name}</span>
      {file.size && <span className="text-xs text-muted-foreground">{file.size}</span>}
      {file.status === "error" && <span className="text-xs text-destructive">Error</span>}
      {onRemove && (
        <button type="button" className="ml-1 text-muted-foreground hover:text-foreground" onClick={() => onRemove(file.id)} aria-label="Eliminar archivo">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default PromptFileChip


