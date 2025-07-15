#!/bin/bash
# DevHub Database Connection Script
# This script provides easy access to your DevHub database through various tools

echo "🚀 DevHub Database Connection Helper"
echo "======================================"
echo ""
echo "Database: devhub_your_business"
echo "Host: localhost"
echo "Port: 5432"
echo "User: beast"
echo ""
echo "Choose your connection method:"
echo "1) psql (Command Line)"
echo "2) Open pgAdmin 4"
echo "3) View Custom Database Dashboard"
echo "4) Show Connection Details"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔌 Opening psql connection..."
        psql -d devhub_your_business
        ;;
    2)
        echo "🔌 Opening pgAdmin 4..."
        open "/Applications/pgAdmin 4.app"
        echo ""
        echo "📋 Connection Details for pgAdmin:"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: devhub_your_business"
        echo "   Username: beast"
        echo "   Password: (leave blank)"
        ;;
    3)
        echo "🔌 Opening Custom Database Dashboard..."
        open "http://localhost:3005/database"
        ;;
    4)
        echo "📋 DevHub Database Connection Details:"
        echo "   Database URL: postgresql://beast@localhost/devhub_your_business"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: devhub_your_business"
        echo "   Username: beast"
        echo "   Password: (none required)"
        echo ""
        echo "📊 Available Tables:"
        psql -d devhub_your_business -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac
