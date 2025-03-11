from app import app

# This is the entry point for Vercel serverless functions
def handler(request, context):
    return app(request, context) 