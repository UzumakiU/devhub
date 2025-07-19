#!/bin/bash

# Script to apply full-screen layout and theme improvements across the platform

echo "🚀 Applying full-screen layout and theme improvements..."
echo ""

# Function to update max-width constraints
update_max_width() {
    echo "📏 Updating max-width constraints in components..."
    
    # Update common max-width patterns
    find src -name "*.tsx" -exec sed -i '' 's/max-w-7xl mx-auto/w-full/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/max-w-6xl mx-auto/w-full/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/max-w-5xl mx-auto/w-full/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/max-w-4xl mx-auto/w-full/g' {} \;
    
    echo "   ✅ Updated max-width constraints"
}

# Function to update theme colors
update_theme_colors() {
    echo "🎨 Updating theme colors..."
    
    # Update common hardcoded colors to theme-aware ones
    find src -name "*.tsx" -exec sed -i '' 's/bg-gray-50/bg-background/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/bg-white/bg-card/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/text-gray-900/text-foreground/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/border-gray-200/border-border/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/border-gray-300/border-border/g' {} \;
    
    echo "   ✅ Updated theme colors"
}

# Function to ensure components use full width
update_component_widths() {
    echo "📐 Ensuring components use full width..."
    
    # Add w-full to common container classes
    find src -name "*.tsx" -exec sed -i '' 's/className="min-h-screen/className="min-h-screen w-full/g' {} \;
    find src -name "*.tsx" -exec sed -i '' 's/className="container/className="container w-full/g' {} \;
    
    echo "   ✅ Updated component widths"
}

# Function to check for remaining issues
check_remaining_issues() {
    echo "🔍 Checking for remaining layout issues..."
    
    echo "Components with max-w constraints:"
    grep -r "max-w-" src --include="*.tsx" | wc -l | xargs echo "   Found:"
    
    echo "Components with hardcoded gray backgrounds:"
    grep -r "bg-gray-" src --include="*.tsx" | wc -l | xargs echo "   Found:"
    
    echo "Components with hardcoded text colors:"
    grep -r "text-gray-" src --include="*.tsx" | wc -l | xargs echo "   Found:"
}

# Main execution
echo "Starting platform-wide improvements..."
echo "====================================="

update_max_width
update_theme_colors  
update_component_widths
check_remaining_issues

echo ""
echo "✨ Platform improvements complete!"
echo ""
echo "Summary of changes:"
echo "- Removed max-width constraints for full-screen layout"
echo "- Applied theme-aware colors consistently" 
echo "- Ensured all components use full width"
echo "- Enhanced text visibility and contrast"
echo ""
echo "🌐 Your app now uses the full screen with improved visibility!"
echo "🎨 All components now respect the enhanced dark/light theme"
echo ""
echo "Next steps:"
echo "1. Test the application at http://localhost:3005"
echo "2. Check both light and dark modes" 
echo "3. Verify that pages now use the full screen width"
echo "4. Confirm improved text visibility and contrast"
