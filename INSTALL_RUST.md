# Installing Rust and Cargo

## The Problem

Cargo (Rust's package manager) is not installed, which is required for Tauri development.

## Installation

### Option 1: Install via rustup (Recommended)

This is the official and recommended way:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the prompts (defaults are usually fine), then:

```bash
source ~/.cargo/env
```

Or restart your terminal.

### Option 2: Install via apt (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install rustc cargo
```

### Option 3: Install via snap

```bash
sudo snap install rustup
rustup default stable
```

## Verify Installation

After installation, verify it works:

```bash
rustc --version
cargo --version
```

You should see version numbers for both.

## After Installation

Once Rust/Cargo is installed, you can run:

```bash
cd /home/christina/.cursor/autospec
npm run tauri:dev
```

## First Run

The first time you run `tauri:dev`, it will:
- Download and compile Rust dependencies (this takes several minutes)
- Build the Tauri backend
- Start the development server

Be patient on the first run - it's downloading and compiling a lot of code!

