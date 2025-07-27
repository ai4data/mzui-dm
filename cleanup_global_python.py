#!/usr/bin/env python3
"""
Python Global Package Cleanup Script
Safely removes all third-party packages from global Python installation
while preserving the standard library and essential tools.
"""

import subprocess
import sys
import os
from pathlib import Path

# Target Python interpreter
PYTHON_EXE = r"C:\Users\Hicham\AppData\Local\Programs\Python\Python311\python.exe"

# Standard library modules that come with Python (partial list of common ones)
STANDARD_LIBRARY_MODULES = {
    'pip', 'setuptools', 'wheel',  # Essential packaging tools
    'distutils', 'ensurepip',      # Core packaging
}

# Packages that should never be uninstalled (critical for pip functionality)
PROTECTED_PACKAGES = {
    'pip', 'setuptools', 'wheel', 'distutils', 'ensurepip'
}

def run_command(cmd, capture_output=True):
    """Run a command and return the result."""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=capture_output, 
            text=True,
            check=False
        )
        return result
    except Exception as e:
        print(f"Error running command '{cmd}': {e}")
        return None

def get_installed_packages():
    """Get list of installed packages using pip list."""
    print("Getting list of installed packages...")
    
    cmd = f'"{PYTHON_EXE}" -m pip list --format=freeze'
    result = run_command(cmd)
    
    if result is None or result.returncode != 0:
        print("Failed to get package list")
        return []
    
    packages = []
    for line in result.stdout.strip().split('\n'):
        if line and '==' in line:
            package_name = line.split('==')[0].strip()
            packages.append(package_name)
    
    return packages

def is_third_party_package(package_name):
    """Determine if a package is third-party (not part of standard library)."""
    # Convert to lowercase for comparison
    package_lower = package_name.lower()
    
    # Skip protected packages
    if package_lower in PROTECTED_PACKAGES:
        return False
    
    # Check if it's a standard library module by trying to import it
    # and checking if it's in the standard library path
    try:
        cmd = f'"{PYTHON_EXE}" -c "import {package_name}; import os; print(os.path.dirname({package_name}.__file__) if hasattr({package_name}, \'__file__\') else \'builtin\')"'
        result = run_command(cmd)
        
        if result and result.returncode == 0:
            module_path = result.stdout.strip()
            # If it's in the Python installation directory's Lib folder, it might be standard
            python_lib_path = str(Path(PYTHON_EXE).parent / "Lib")
            if module_path.startswith(python_lib_path) and "site-packages" not in module_path:
                return False
    except:
        pass
    
    # Most third-party packages will be in site-packages
    return True

def uninstall_package(package_name):
    """Uninstall a single package."""
    print(f"Uninstalling {package_name}...")
    
    cmd = f'"{PYTHON_EXE}" -m pip uninstall -y "{package_name}"'
    result = run_command(cmd, capture_output=False)
    
    if result and result.returncode == 0:
        print(f"✓ Successfully uninstalled {package_name}")
        return True
    else:
        print(f"✗ Failed to uninstall {package_name}")
        return False

def main():
    """Main cleanup function."""
    print("=" * 60)
    print("Python Global Package Cleanup Script")
    print("=" * 60)
    print(f"Target Python: {PYTHON_EXE}")
    print()
    
    # Verify Python executable exists
    if not os.path.exists(PYTHON_EXE):
        print(f"Error: Python executable not found at {PYTHON_EXE}")
        return
    
    # Get installed packages
    packages = get_installed_packages()
    if not packages:
        print("No packages found or failed to get package list.")
        return
    
    print(f"Found {len(packages)} installed packages")
    print()
    
    # Filter third-party packages
    third_party_packages = []
    protected_packages = []
    
    for package in packages:
        if is_third_party_package(package):
            third_party_packages.append(package)
        else:
            protected_packages.append(package)
    
    print("Protected packages (will NOT be removed):")
    for pkg in sorted(protected_packages):
        print(f"  - {pkg}")
    print()
    
    print("Third-party packages to be removed:")
    for pkg in sorted(third_party_packages):
        print(f"  - {pkg}")
    print()
    
    if not third_party_packages:
        print("No third-party packages found to remove.")
        return
    
    # Confirm before proceeding
    response = input(f"Remove {len(third_party_packages)} third-party packages? (y/N): ")
    if response.lower() not in ['y', 'yes']:
        print("Cleanup cancelled.")
        return
    
    print("\nStarting cleanup...")
    print("-" * 40)
    
    # Uninstall packages
    successful = 0
    failed = 0
    
    for package in third_party_packages:
        if uninstall_package(package):
            successful += 1
        else:
            failed += 1
    
    print("-" * 40)
    print(f"Cleanup complete!")
    print(f"Successfully removed: {successful} packages")
    print(f"Failed to remove: {failed} packages")
    
    # Show final package list
    print("\nFinal package list:")
    final_packages = get_installed_packages()
    for pkg in sorted(final_packages):
        print(f"  - {pkg}")

if __name__ == "__main__":
    main()