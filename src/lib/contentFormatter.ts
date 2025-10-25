/**
 * Utility functions for formatting lesson content
 */

/**
 * Format content with basic markdown-like styling
 * @param content The content string to format
 * @returns Formatted HTML content
 */
export function formatContent(content: string): string {
  if (!content) return '';
  
  return content
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle bullet points (lines starting with •)
    .replace(/^• (.*$)/gm, '<li>$1</li>')
    // Wrap consecutive <li> elements in <ul>
    .replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>')
    // Handle numbered lists (lines starting with digits followed by a period)
    .replace(/^(\d+)\. (.*$)/gm, '<li data-index="$1">$2</li>')
    // Wrap consecutive numbered list items in <ol>
    .replace(/(<li data-index="\d+">.*<\/li>\s*)+/g, '<ol>$&</ol>')
    // Remove data-index attributes
    .replace(/ data-index="\d+"/g, '')
    // Handle line breaks
    .replace(/\n/g, '<br />')
    // Clean up extra <br> tags
    .replace(/(<br\s*\/?>\s*)+/g, '<br /><br />')
    // Handle multiple consecutive <br> tags
    .replace(/(<br\s*\/?>\s*){3,}/g, '</p><p>');
}

/**
 * Sanitize SVG content to prevent XSS
 * @param svg The SVG content to sanitize
 * @returns Sanitized SVG content
 */
export function sanitizeSVG(svg: string): string {
  if (!svg) return '';
  
  // Basic sanitization - remove script tags and on* attributes
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Truncate text to a specified length
 * @param text The text to truncate
 * @param maxLength The maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Format time in seconds to MM:SS format
 * @param seconds The time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}