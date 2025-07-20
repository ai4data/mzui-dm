#!/usr/bin/env python3
"""
Database switching utility for MZUI Data Marketplace
Usage: python switch_database.py [local|supabase|supabase2]
"""

import sys
import os
import shutil

def switch_database(target):
    """Switch to the specified database configuration"""
    
    # Define available configurations
    configs = {
        'local': '.env.local',
        'supabase': '.env.supabase', 
        'supabase2': '.env.supabase2'
    }
    
    if target not in configs:
        print(f"❌ Invalid database target: {target}")
        print(f"Available options: {', '.join(configs.keys())}")
        return False
    
    source_file = configs[target]
    target_file = '.env'
    
    # Check if source file exists
    if not os.path.exists(source_file):
        print(f"❌ Configuration file not found: {source_file}")
        return False
    
    try:
        # Copy the configuration file
        shutil.copy2(source_file, target_file)
        print(f"✅ Switched to {target} database")
        print(f"📁 Copied {source_file} → {target_file}")
        
        # Show current configuration
        with open(target_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if line.startswith('DATABASE_URL=') or line.startswith('DB_HOST='):
                    print(f"🔗 {line.strip()}")
                    break
        
        print("\n🔄 Please restart the API server:")
        print("   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to switch database: {e}")
        return False

def show_current():
    """Show current database configuration"""
    if not os.path.exists('.env'):
        print("❌ No active database configuration found (.env file missing)")
        return
    
    print("📊 Current database configuration:")
    with open('.env', 'r') as f:
        lines = f.readlines()
        for line in lines:
            if line.startswith('DATABASE_URL='):
                url = line.strip().split('=', 1)[1]
                if 'localhost' in url:
                    print("🏠 Local PostgreSQL")
                elif 'eu-west-1' in url:
                    print("☁️  Supabase (EU-West-1)")
                elif 'eu-central-1' in url:
                    print("☁️  Supabase2 (EU-Central-1)")
                else:
                    print(f"🔗 Custom: {url}")
                break
            elif line.startswith('DB_HOST='):
                host = line.strip().split('=', 1)[1]
                print(f"🔗 Host: {host}")
                break

def main():
    print("🔄 MZUI Data Marketplace - Database Switcher")
    print("=" * 45)
    
    if len(sys.argv) < 2:
        show_current()
        print("\nUsage:")
        print("  python switch_database.py local      # Switch to local PostgreSQL")
        print("  python switch_database.py supabase   # Switch to original Supabase")
        print("  python switch_database.py supabase2  # Switch to Supabase2 (faster)")
        print("  python switch_database.py current    # Show current configuration")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'current':
        show_current()
    else:
        success = switch_database(command)
        if not success:
            sys.exit(1)

if __name__ == "__main__":
    main()