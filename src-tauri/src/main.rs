// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct ChatContext {
    name: Option<String>,
    requirements_count: Option<usize>,
    /// Intent Engineering: purpose, strategy, goals (what we want agents to optimize for).
    intent: Option<String>,
    /// Context Engineering: what information/tokens to supply to the agent(s).
    context: Option<String>,
}

#[tauri::command]
async fn chat_with_ai(
    message: String,
    context: Option<ChatContext>,
    provider: Option<String>,
    temperature: Option<f32>,
    max_tokens: Option<u32>,
) -> Result<String, String> {
    let mut system_prompt = "You are an AI assistant helping users produce complete agent-ready specifications. The user is working in three disciplines:\n\
1. **Intent Engineering (Strategy)**: Purpose, why we're building, goals, trade-off hierarchy, decision boundaries—what the agent(s) should optimize for.\n\
2. **Context Engineering**: What information and tokens to supply to the agent(s); curation strategy and key sources so the task is self-contained and plausibly solvable without fetching more context.\n\
3. **Specification Engineering**: Complete, structured descriptions of outputs, acceptance criteria, constraints, decomposition, and how quality is measured—so autonomous agents can execute over extended time without human intervention.\n\
Help the user articulate intent, define context strategy, and write clear, complete specifications. Ask clarifying questions and suggest improvements.".to_string();

    if let Some(ctx) = context {
        if let Some(name) = ctx.name {
            system_prompt.push_str(&format!("\n\nCurrent document: {}", name));
        }
        if let Some(count) = ctx.requirements_count {
            system_prompt.push_str(&format!("\nNumber of requirements: {}", count));
        }
        if let Some(ref intent) = ctx.intent {
            if !intent.is_empty() {
                system_prompt.push_str(&format!("\n\nCurrent Intent (Strategy) section:\n{}", intent));
            }
        }
        if let Some(ref ctx_text) = ctx.context {
            if !ctx_text.is_empty() {
                system_prompt.push_str(&format!("\n\nCurrent Context Engineering section:\n{}", ctx_text));
            }
        }
    }

    // Determine provider (fallback to OpenAI if none specified)
    let selected = provider
        .as_deref()
        .unwrap_or("openai")
        .to_lowercase();

    let temperature = temperature.unwrap_or(0.7);
    let max_tokens = max_tokens.unwrap_or(1000);

    match selected.as_str() {
        "openai" => call_openai(&message, &system_prompt, temperature, max_tokens).await,
        "anthropic" => call_anthropic(&message, &system_prompt, temperature, max_tokens).await,
        "gemini" => call_gemini(&message, &system_prompt, temperature, max_tokens).await,
        "grok" => call_grok(&message, &system_prompt, temperature, max_tokens).await,
        "ollama" => call_ollama(&message, &system_prompt, temperature).await,
        other => Err(format!("Unsupported AI provider: {}", other)),
    }
}

async fn call_openai(
    message: &str,
    system_prompt: &str,
    temperature: f32,
    max_tokens: u32,
) -> Result<String, String> {
    let api_key = std::env::var("OPENAI_API_KEY")
        .map_err(|_| "No OpenAI API key configured. Please set OPENAI_API_KEY.".to_string())?;

    let client = reqwest::Client::new();

    let payload = serde_json::json!({
        "model": "gpt-4",
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": message }
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send OpenAI request: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("OpenAI API error: {}", error_text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("Invalid OpenAI response format")?;

    Ok(content.to_string())
}

async fn call_anthropic(
    message: &str,
    system_prompt: &str,
    temperature: f32,
    max_tokens: u32,
) -> Result<String, String> {
    let api_key = std::env::var("ANTHROPIC_API_KEY")
        .map_err(|_| "No Anthropic API key configured. Please set ANTHROPIC_API_KEY.".to_string())?;

    let client = reqwest::Client::new();

    let payload = serde_json::json!({
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": [
                    { "type": "text", "text": message }
                ]
            }
        ]
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send Anthropic request: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Anthropic API error: {}", error_text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Anthropic response: {}", e))?;

    let content = json["content"][0]["text"]
        .as_str()
        .ok_or("Invalid Anthropic response format")?;

    Ok(content.to_string())
}

async fn call_gemini(
    message: &str,
    system_prompt: &str,
    temperature: f32,
    max_tokens: u32,
) -> Result<String, String> {
    let api_key = std::env::var("GEMINI_API_KEY")
        .map_err(|_| "No Google Gemini API key configured. Please set GEMINI_API_KEY.".to_string())?;

    let client = reqwest::Client::new();

    // Simple single-turn prompt combining system and user messages
    let combined = format!("System: {}\n\nUser: {}", system_prompt, message);

    let payload = serde_json::json!({
        "contents": [
            {
                "parts": [
                    { "text": combined }
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }
    });

    let url = format!("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={}", api_key);

    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send Gemini request: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Gemini API error: {}", error_text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Gemini response: {}", e))?;

    let content = json["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .ok_or("Invalid Gemini response format")?;

    Ok(content.to_string())
}

async fn call_grok(
    message: &str,
    system_prompt: &str,
    temperature: f32,
    max_tokens: u32,
) -> Result<String, String> {
    let api_key = std::env::var("GROK_API_KEY")
        .map_err(|_| "No Grok API key configured. Please set GROK_API_KEY.".to_string())?;

    let client = reqwest::Client::new();

    let payload = serde_json::json!({
        "model": "grok-beta",
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": message }
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    });

    let response = client
        .post("https://api.x.ai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send Grok request: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Grok API error: {}", error_text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Grok response: {}", e))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("Invalid Grok response format")?;

    Ok(content.to_string())
}

async fn call_ollama(
    message: &str,
    system_prompt: &str,
    temperature: f32,
) -> Result<String, String> {
    let base = std::env::var("OLLAMA_BASE_URL")
        .unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());

    let client = reqwest::Client::new();

    let payload = serde_json::json!({
        "model": "llama3.1",
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": message }
        ],
        "options": {
            "temperature": temperature
        }
    });

    let url = format!("{}/api/chat", base.trim_end_matches('/'));

    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send Ollama request: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Ollama API error: {}", error_text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    let content = json["message"]["content"]
        .as_str()
        .ok_or("Invalid Ollama response format")?;

    Ok(content.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![chat_with_ai])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

