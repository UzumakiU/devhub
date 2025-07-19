#!/bin/bash

# Script to help find components that need text visibility improvements

echo "🔍 Finding components with text visibility issues..."
echo ""

echo "📝 Components using small text that should be reviewed:"
echo "=================================================="
grep -r "text-xs\|text-sm" src/components --include="*.tsx" | head -10

echo ""
echo "🎨 Components using hardcoded gray colors:"
echo "=========================================="
grep -r "text-gray-[0-9]" src/components --include="*.tsx" | head -10

echo ""
echo "🚨 Components using hardcoded status colors:"
echo "==========================================="
grep -r "text-red-[0-9]\|text-green-[0-9]\|text-yellow-[0-9]\|text-orange-[0-9]" src/components --include="*.tsx" | head -10

echo ""
echo "📋 Components using non-theme-aware backgrounds:"
echo "==============================================="
grep -r "bg-white\|bg-gray-[0-9]" src/components --include="*.tsx" | head -10

echo ""
echo "✅ Recommended replacements:"
echo "============================"
echo "text-gray-600 → text-muted-foreground"
echo "text-gray-500 → text-muted-foreground" 
echo "bg-white → bg-card"
echo "border-gray-200 → border-border"
echo "text-red-600 → text-error (or use StatusBadge component)"
echo "text-green-600 → text-success (or use StatusBadge component)"
echo ""
echo "📖 See docs/TEXT_VISIBILITY_IMPROVEMENTS.md for complete guide"
