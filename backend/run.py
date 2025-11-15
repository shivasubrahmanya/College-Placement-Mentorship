"""
Simple script to run the FastAPI server
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 50)
    print("Starting FastAPI Backend Server")
    print("=" * 50)
    print("Server will be available at:")
    print("  - http://127.0.0.1:8000")
    print("  - http://localhost:8000")
    print("=" * 50)
    # Use 0.0.0.0 to bind to all interfaces (IPv4 and IPv6)
    # This ensures the server is accessible from both localhost and 127.0.0.1
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Bind to all IPv4 interfaces
        port=8000,
        reload=True
    )
