from fastapi import FastAPI
from app.routers import products, auth


app = FastAPI(title="Shoe store API")

app.include_router(products.router)
app.include_router(auth.router)


@app.get("/health")
def health():
    return {"status": "healthy"}