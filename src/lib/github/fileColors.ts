// GitHub-like language colors for file extensions
export const fileExtensionColors: Record<string, string> = {
  // Programming Languages
  '.ts': '#3178C6',  // TypeScript
  '.tsx': '#3178C6', // TypeScript React
  '.js': '#F7DF1E',  // JavaScript
  '.jsx': '#F7DF1E', // JavaScript React
  '.py': '#3776AB',  // Python
  '.java': '#B07219', // Java
  '.cpp': '#F34B7D',  // C++
  '.c': '#555555',   // C
  '.cs': '#178600',  // C#
  '.go': '#00ADD8',  // Go
  '.rb': '#CC342D',  // Ruby
  '.php': '#4F5D95', // PHP
  '.swift': '#F05138', // Swift
  '.kt': '#A97BFF',  // Kotlin
  '.rs': '#DEA584',  // Rust

  // Web Technologies
  '.html': '#E34C26', // HTML
  '.css': '#563D7C',  // CSS
  '.scss': '#C6538C', // SCSS
  '.less': '#1D365D', // Less
  '.vue': '#41B883',  // Vue
  '.svelte': '#FF3E00', // Svelte

  // Data & Config
  '.json': '#292929', // JSON
  '.xml': '#0060AC',  // XML
  '.yaml': '#CB171E', // YAML
  '.yml': '#CB171E',  // YAML
  '.toml': '#9C4221', // TOML
  '.ini': '#D1DDE9',  // INI
  '.env': '#509941',  // Environment

  // Documentation
  '.md': '#083FA1',   // Markdown
  '.mdx': '#1B2B34',  // MDX
  '.txt': '#6E7681',  // Text
  '.doc': '#2B579A',  // Word
  '.pdf': '#B30B00',  // PDF

  // Shell & Scripts
  '.sh': '#89E051',   // Shell
  '.bash': '#89E051', // Bash
  '.ps1': '#012456',  // PowerShell
  '.bat': '#C1F12E',  // Batch

  // Images
  '.png': '#A6CC33',  // PNG
  '.jpg': '#FFB13B',  // JPEG
  '.jpeg': '#FFB13B', // JPEG
  '.gif': '#FF69B4',  // GIF
  '.svg': '#FFB13B',  // SVG
  '.ico': '#FFB13B',  // Icon

  // Other
  '.sql': '#E38C00',  // SQL
  '.db': '#003B57',   // Database
  '.zip': '#6E7681',  // ZIP
  '.tar': '#6E7681',  // TAR
  '.gz': '#6E7681',   // GZIP
  '.lock': '#F8C200', // Lock files
  '.log': '#B5B5B5',  // Log files
}

export function getFileColor(filename: string): string {
  const extension = '.' + filename.split('.').pop()?.toLowerCase() || ''
  return fileExtensionColors[extension] || '#8B949E' // Default color for unknown extensions
}

export function getLightFileColor(filename: string): string {
  const color = getFileColor(filename)
  return color + '20' // Add 20 for 12.5% opacity
}

export function getBorderFileColor(filename: string): string {
  const color = getFileColor(filename)
  return color + '40' // Add 40 for 25% opacity
} 