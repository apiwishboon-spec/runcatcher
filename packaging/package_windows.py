import os
import sys
import multiprocessing
import threading
import uvicorn
import webview
import socket
from app.main import app

def get_free_port():
    """Find a free port on localhost."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', 0))
    port = sock.getsockname()[1]
    sock.close()
    return port

def start_server(port):
    """Start the FastAPI server."""
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")

if __name__ == "__main__":
    # Standard PyInstaller multiprocessing support
    multiprocessing.freeze_support()

    # Get a free port
    port = get_free_port()
    url = f"http://127.0.0.1:{port}"

    # Start the server in a separate thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()

    # Create a webview window
    window = webview.create_window('LibraryRunCatcher', url, width=1280, height=800)
    
    # Start the webview loop
    webview.start()
