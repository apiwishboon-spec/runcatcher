#!/usr/bin/env python3
import markdown
import pdfkit
import os

# Read the markdown file
with open('MANUAL.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert to HTML
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>LibraryRunCatcher Manual</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f6fafe;
        }}
        h1 {{ color: #216487; border-bottom: 3px solid #ffd9e2; padding-bottom: 10px; }}
        h2 {{ color: #216487; border-bottom: 2px solid #ffd9e2; padding-bottom: 5px; }}
        h3 {{ color: #216487; }}
        code {{ background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }}
        pre {{ background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }}
        blockquote {{ border-left: 4px solid #bdc3c7; padding-left: 15px; margin-left: 0; }}
        table {{ border-collapse: collapse; width: 100%; margin: 15px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; }}
        .info {{ background: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; border-radius: 5px; }}
    </style>
</head>
<body>
{markdown.markdown(md_content, extensions=['tables', 'fenced_code'])}
</body>
</html>
"""

# Try to convert to PDF using pdfkit if available
try:
    import pdfkit
    pdfkit.from_string(html_content, 'manual.pdf')
    print("PDF generated successfully using pdfkit!")
except ImportError:
    # If pdfkit is not available, save as HTML that can be printed to PDF
    with open('manual.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("HTML file generated. You can open manual.html in a browser and print to PDF.")

print("Manual generation complete!")
