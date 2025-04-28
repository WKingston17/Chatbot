import os
import json
import asyncio
import psutil
import platform
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from llama_cpp import Llama
from sse_starlette.sse import EventSourceResponse
from contextlib import asynccontextmanager

# Configuration
MODEL_PATH = os.environ.get("MODEL_PATH", "models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf")
MODEL_DIR = os.environ.get("MODEL_DIR", "models")
MAX_TOKENS = 2000
TEMPERATURE = 0.7
TOP_P = 0.9
TOP_K = 40
FREQUENCY_PENALTY = 0.0
PRESENCE_PENALTY = 0.0
# Nombre de couches GPU par défaut, modifiable via variable d'environnement
DEFAULT_GPU_LAYERS = int(os.environ.get("GPU_LAYERS", 0))
SYSTEM_PROMPT = """Tu es TURBO PECH, un assistant pédagogique pour les élèves du collège et du lycée. 
Tu es spécialisé dans l'explication de cours et l'aide aux devoirs.
Tu donnes des explications claires, concises et adaptées au niveau scolaire de l'élève.
Tu peux expliquer des concepts difficiles avec des exemples concrets.
Tu encourages l'élève à réfléchir par lui-même."""

# Model loading management
model_instance = None
model_info = {
    "model_path": MODEL_PATH,
    "load_time": None,
    "n_ctx": 4096,
    "n_batch": 512,
    "n_gpu_layers": DEFAULT_GPU_LAYERS,
    "inference_stats": {
        "total_requests": 0,
        "avg_response_time": 0,
        "total_time": 0
    }
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    global model_instance, model_info
    try:
        start_time = datetime.now()
        print(f"Démarrage du chargement du modèle: {MODEL_PATH}")
        print(f"Utilisation de {model_info['n_gpu_layers']} couches GPU")
        
        model_instance = Llama(
            model_path=MODEL_PATH,
            n_ctx=model_info["n_ctx"],
            n_batch=model_info["n_batch"],
            n_gpu_layers=model_info["n_gpu_layers"]
        )
        load_time = (datetime.now() - start_time).total_seconds()
        model_info["load_time"] = load_time
        print(f"Model loaded from {MODEL_PATH} in {load_time:.2f} seconds")
    except Exception as e:
        print(f"Error loading model: {e}")
        model_instance = None
    
    yield
    
    # Clean up on shutdown
    model_instance = None
    print("Model unloaded")

app = FastAPI(lifespan=lifespan, title="TurboPech API", description="API pour le chatbot éducatif TurboPech")

# Autoriser les requêtes CORS depuis n'importe quelle origine
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: Optional[int] = MAX_TOKENS
    temperature: Optional[float] = TEMPERATURE
    top_p: Optional[float] = TOP_P
    top_k: Optional[int] = TOP_K
    frequency_penalty: Optional[float] = FREQUENCY_PENALTY
    presence_penalty: Optional[float] = PRESENCE_PENALTY
    stream: Optional[bool] = False

class ModelChangeRequest(BaseModel):
    model_file: str
    n_ctx: Optional[int] = 4096
    n_batch: Optional[int] = 512
    n_gpu_layers: Optional[int] = DEFAULT_GPU_LAYERS

def format_chat_messages(messages: List[ChatMessage]):
    """Format messages for Llama chat models"""
    formatted_msgs = []
    
    # Add system prompt as the first message if not present
    if not messages or messages[0].role != "system":
        formatted_msgs.append({"role": "system", "content": SYSTEM_PROMPT})
    
    # Add user messages
    for msg in messages:
        formatted_msgs.append({"role": msg.role, "content": msg.content})
    
    return formatted_msgs

async def stream_generator(messages, params):
    if model_instance is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    formatted_msgs = format_chat_messages(messages)
    
    try:
        start_time = datetime.now()
        
        stream = model_instance.create_chat_completion(
            messages=formatted_msgs,
            max_tokens=params.get("max_tokens", MAX_TOKENS),
            temperature=params.get("temperature", TEMPERATURE),
            top_p=params.get("top_p", TOP_P),
            top_k=params.get("top_k", TOP_K),
            frequency_penalty=params.get("frequency_penalty", FREQUENCY_PENALTY),
            presence_penalty=params.get("presence_penalty", PRESENCE_PENALTY),
            stream=True
        )
        
        collected_content = ""
        for chunk in stream:
            if not chunk:
                continue
            
            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
            collected_content += content
            
            if content:
                yield json.dumps({
                    "type": "chunk",
                    "data": content
                })
                
            # Add a small delay to avoid overwhelming the client
            await asyncio.sleep(0.01)
        
        # Update model stats
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds()
        
        model_info["inference_stats"]["total_requests"] += 1
        model_info["inference_stats"]["total_time"] += response_time
        model_info["inference_stats"]["avg_response_time"] = (
            model_info["inference_stats"]["total_time"] / model_info["inference_stats"]["total_requests"]
        )
            
        # Send final message with timing info
        yield json.dumps({
            "type": "end",
            "data": collected_content,
            "stats": {
                "response_time": response_time,
                "message_length": len(collected_content)
            }
        })
            
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "data": str(e)
        })

@app.get("/")
async def root():
    return {"message": "TurboPech API is running"}

@app.get("/status")
async def status():
    if model_instance is None:
        return {"status": "Model not loaded"}
    
    # Return extended model information
    return {
        "status": "Model loaded", 
        "model_path": MODEL_PATH,
        "model_name": os.path.basename(MODEL_PATH),
        "load_time": model_info["load_time"],
        "n_ctx": model_info["n_ctx"],
        "n_batch": model_info["n_batch"],
        "n_gpu_layers": model_info["n_gpu_layers"],
        "inference_stats": model_info["inference_stats"]
    }

@app.get("/system-stats")
async def system_stats():
    """Return system statistics (CPU, memory, etc.)"""
    return {
        "cpu_percent": psutil.cpu_percent(),
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent,
            "used": psutil.virtual_memory().used
        },
        "platform": platform.platform(),
        "python_version": platform.python_version(),
        "uptime": datetime.now().timestamp() - psutil.boot_time()
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    if model_instance is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    formatted_msgs = format_chat_messages(request.messages)
    
    try:
        params = {
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p,
            "top_k": request.top_k,
            "frequency_penalty": request.frequency_penalty,
            "presence_penalty": request.presence_penalty
        }
        
        if request.stream:
            return EventSourceResponse(stream_generator(request.messages, params))
        else:
            start_time = datetime.now()
            
            response = model_instance.create_chat_completion(
                messages=formatted_msgs,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p,
                top_k=request.top_k,
                frequency_penalty=request.frequency_penalty,
                presence_penalty=request.presence_penalty,
                stream=False
            )
            
            # Update model stats
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()
            
            model_info["inference_stats"]["total_requests"] += 1
            model_info["inference_stats"]["total_time"] += response_time
            model_info["inference_stats"]["avg_response_time"] = (
                model_info["inference_stats"]["total_time"] / model_info["inference_stats"]["total_requests"]
            )
            
            # Add timing information to the response
            response["stats"] = {
                "response_time": response_time,
                "message_length": len(response["choices"][0]["message"]["content"])
            }
            
            return response
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoint to list available models
@app.get("/models")
async def list_models():
    """List all available GGUF models in the models directory"""
    try:
        models = []
        if os.path.exists(MODEL_DIR):
            for file in os.listdir(MODEL_DIR):
                if file.endswith(".gguf"):
                    model_path = os.path.join(MODEL_DIR, file)
                    model_size = os.path.getsize(model_path) / (1024 * 1024 * 1024)  # Size in GB
                    models.append({
                        "filename": file,
                        "path": model_path,
                        "size_gb": round(model_size, 2),
                        "is_active": model_path == MODEL_PATH
                    })
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to change the model
@app.post("/change-model")
async def change_model(model_request: ModelChangeRequest = None, model_file: str = Query(None)):
    """Change the active model - can be called with either query param or JSON body"""
    global model_instance, MODEL_PATH, model_info
    
    # Support both query parameters and request body
    if model_request is not None:
        model_file = model_request.model_file
        n_ctx = model_request.n_ctx
        n_batch = model_request.n_batch
        n_gpu_layers = model_request.n_gpu_layers
    else:
        if model_file is None:
            raise HTTPException(status_code=400, detail="No model file specified")
        n_ctx = 4096
        n_batch = 512
        n_gpu_layers = DEFAULT_GPU_LAYERS
    
    new_model_path = os.path.join(MODEL_DIR, model_file)
    
    if not os.path.exists(new_model_path):
        raise HTTPException(status_code=404, detail=f"Model file not found: {model_file}")
    
    try:
        # Unload current model
        model_instance = None
        
        # Update model info
        model_info = {
            "model_path": new_model_path,
            "load_time": None,
            "n_ctx": n_ctx,
            "n_batch": n_batch,
            "n_gpu_layers": n_gpu_layers,
            "inference_stats": {
                "total_requests": 0,
                "avg_response_time": 0,
                "total_time": 0
            }
        }
        
        # Load new model
        start_time = datetime.now()
        model_instance = Llama(
            model_path=new_model_path,
            n_ctx=n_ctx,
            n_batch=n_batch,
            n_gpu_layers=n_gpu_layers
        )
        load_time = (datetime.now() - start_time).total_seconds()
        model_info["load_time"] = load_time
        
        MODEL_PATH = new_model_path
        return {
            "status": "Model changed successfully", 
            "model_path": MODEL_PATH,
            "model_name": os.path.basename(MODEL_PATH),
            "load_time": load_time,
            "n_ctx": n_ctx,
            "n_batch": n_batch
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 