/**
 * Component Loader
 * Dynamically loads and initializes shared HTML components
 */

class ComponentLoader {
    constructor() {
        this.componentCache = {};
        this.loadedComponents = new Set();
    }
    
    /**
     * Load a component from HTML file
     */
    async load(componentName, targetSelector) {
        try {
            const componentPath = `/web_app/src/shared/components/${componentName}.html`;
            
            // Check cache
            if (this.componentCache[componentName]) {
                this.render(this.componentCache[componentName], targetSelector);
                return this.componentCache[componentName];
            }
            
            // Fetch component
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }
            
            const html = await response.text();
            
            // Cache the component
            this.componentCache[componentName] = html;
            
            // Render component
            this.render(html, targetSelector);
            
            // Mark as loaded
            this.loadedComponents.add(componentName);
            
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return null;
        }
    }
    
    /**
     * Render component HTML to target element
     */
    render(html, targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`Target element not found: ${targetSelector}`);
            return;
        }
        
        target.innerHTML = html;
    }
    
    /**
     * Load multiple components
     */
    async loadMultiple(components) {
        const promises = components.map(({ name, selector }) => 
            this.load(name, selector)
        );
        
        return Promise.all(promises);
    }
    
    /**
     * Check if component is loaded
     */
    isLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }
}

// Create singleton instance
const componentLoader = new ComponentLoader();

// Expose globally
if (typeof window !== 'undefined') {
    window.componentLoader = componentLoader;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentLoader, componentLoader };
}
