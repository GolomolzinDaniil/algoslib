import os
import traceback

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .routers import sorting, graphs

app = FastAPI(title="algoslib")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

app.include_router(sorting.router, prefix="/api/sorting")
app.include_router(graphs.router, prefix="/api/graphs")

static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))
