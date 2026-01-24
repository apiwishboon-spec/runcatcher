#!/usr/bin/env python3
"""
LibraryRunCatcher Manual PDF Converter

This script helps convert the MANUAL.md file to PDF format.
Since direct PDF generation requires additional dependencies,
this script provides instructions for various conversion methods.
"""

import os
import webbrowser
import subprocess

def print_instructions():
    print("🔧 LibraryRunCatcher Manual PDF Generation")
    print("=" * 50)

    print("\n📄 MANUAL.md has been created with comprehensive documentation!")
    print("📊 Current manual includes:")
    print("   • 14 detailed sections")
    print("   • Installation & setup guides")
    print("   • CCTV Grid Mode documentation")
    print("   • Librarian's Watch sync instructions")
    print("   • Troubleshooting & technical specs")

    print("\n📋 PDF Conversion Options:")
    print("\n1️⃣  Online Converters (Recommended):")
    print("   • https://www.markdowntopdf.com/")
    print("   • https://md-to-pdf.fly.dev/")
    print("   • https://markdown-pdf.netlify.app/")
    print("   • Copy MANUAL.md content and paste into any of these tools")

    print("\n2️⃣  Command Line (if you have pandoc + LaTeX):")
    print("   brew install pandoc")
    print("   brew install --cask mactex")
    print("   pandoc MANUAL.md -o manual.pdf --pdf-engine=pdflatex")

    print("\n3️⃣  Browser Method:")
    print("   • Open MANUAL.md in GitHub or any markdown viewer")
    print("   • Print to PDF (Ctrl+P → Save as PDF)")

    print("\n4️⃣  VS Code Extension:")
    print("   • Install 'Markdown PDF' extension")
    print("   • Open MANUAL.md and run 'Markdown PDF: Export'")

    print("\n🎯 Quick Start:")
    print("1. Copy the content of MANUAL.md")
    print("2. Go to https://md-to-pdf.fly.dev/")
    print("3. Paste content and click 'Convert'")
    print("4. Download the generated PDF")

def open_online_converter():
    """Open a markdown to PDF converter in browser"""
    url = "https://md-to-pdf.fly.dev/"
    try:
        webbrowser.open(url)
        print(f"✅ Opened {url} in your browser")
    except:
        print(f"📋 Please visit: {url}")

def check_manual_exists():
    """Check if MANUAL.md exists"""
    if os.path.exists('MANUAL.md'):
        print("✅ MANUAL.md found")
        return True
    else:
        print("❌ MANUAL.md not found")
        return False

if __name__ == "__main__":
    check_manual_exists()
    print_instructions()

    print("\n🚀 Would you like to open an online converter?")
    response = input("Enter 'y' to open browser, or any key to show instructions: ").lower().strip()

    if response == 'y':
        open_online_converter()
    else:
        print("\n📖 Use any of the conversion methods listed above!")
        print("💡 The MANUAL.md file contains comprehensive documentation for LibraryRunCatcher v2.0")
