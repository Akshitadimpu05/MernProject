/**
 * GSAPInfoBar - A simple utility to display GSAP information bar
 * This is a simplified version of the GSAP InfoBar for educational purposes
 */

export class GSAPInfoBar {
  constructor(options = {}) {
    this.options = {
      link: options.link || "https://gsap.com",
      position: options.position || "bottom",
      text: options.text || "Powered by GSAP",
      color: options.color || "#ff16ac",
      background: options.background || "rgba(30, 30, 30, 0.85)",
      ...options
    };
    
    this.init();
  }
  
  init() {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Create the bar element
    const bar = document.createElement('div');
    bar.style.position = 'fixed';
    bar.style.zIndex = '9999';
    bar.style.padding = '8px 12px';
    bar.style.fontSize = '12px';
    bar.style.fontFamily = 'Arial, sans-serif';
    bar.style.color = this.options.color;
    bar.style.background = this.options.background;
    bar.style.borderTop = `1px solid ${this.options.color}`;
    bar.style.textAlign = 'center';
    bar.style.width = '100%';
    bar.style.left = '0';
    bar.style.opacity = '0';
    bar.style.transition = 'opacity 0.3s ease';
    
    // Position the bar
    if (this.options.position === 'top') {
      bar.style.top = '0';
    } else {
      bar.style.bottom = '0';
    }
    
    // Add content
    const link = document.createElement('a');
    link.href = this.options.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = this.options.text;
    link.style.color = this.options.color;
    link.style.textDecoration = 'none';
    
    bar.appendChild(link);
    
    // Add to DOM
    document.body.appendChild(bar);
    
    // Show after a delay
    setTimeout(() => {
      bar.style.opacity = '1';
    }, 1000);
    
    // Store reference for cleanup
    this.bar = bar;
  }
  
  // Method to remove the bar
  remove() {
    if (this.bar && this.bar.parentNode) {
      this.bar.parentNode.removeChild(this.bar);
    }
  }
}
