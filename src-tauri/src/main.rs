// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct ChatContext {
    name: Option<String>,
    requirements_count: Option<usize>,
}

#[tauri::command]
async fn chat_with_ai(
    message: String,
    context: Option<ChatContext>,
) -> Result<String, String> {
    // Get API key from environment or config
    let api_key = std::env::var("OPENAI_API_KEY")
        .or_else(|_| std::env::var("ANTHROPIC_API_KEY"))
        .unwrap_or_else(|_| "".to_string());

    if api_key.is_empty() {
        return Err("No API key configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.".to_string());
    }

    // Use OpenAI API (can be extended to support Anthropic)
    let client = reqwest::Client::new();
    
    let mut system_prompt = "You are an AI assistant helping users write requirements documents for AI agents to build software products. You should be helpful, ask clarifying questions, and suggest improvements to requirements.".to_string();
    
    if let Some(ctx) = context {
        if let Some(name) = ctx.name {
            system_prompt.push_str(&format!("\n\nCurrent document: {}", name));
        }
        if let Some(count) = ctx.requirements_count {
            system_prompt.push_str(&format!("\nNumber of requirements: {}", count));
        }
    }

    let payload = serde_json::json!({
        "model": "gpt-4",
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": message
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API error: {}", error_text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("Invalid response format")?;

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

