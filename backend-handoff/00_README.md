# TalkAlign — Backend Handoff Documentation

> **Purpose:** This folder contains the exact specifications for Claude Code to build the TalkAlign backend. Read files in numeric order.

## Tech Stack Requirements
* **Backend Framework:** Express.js (Node.js)
* **Database & Auth & Storage:** Supabase (Free Tier)
* **AI Provider:** OpenAI (Whisper API & GPT-4o)

## Important Constraints
* Implement **ONLY** what is specified in these documents.
* Do **NOT** implement speculative or future features (e.g., PDF export, Telehealth video, auto-suggesting goals, or clinic analytics).
* The "Supervisor" role and portal have been permanently removed from the scope. Do not include supervisor logic.

## Document Index

| File | Description |
|------|-------------|
| `01_Project_Scope.md` | Core workflows, roles, and domain terms |
| `02_Architecture_and_Stack.md` | Recommended folder structure and environment requirements |
| `03_Database_Schema.md` | Supabase PostgreSQL schema specifications |
| `04_API_Reference.md` | REST API endpoints required by the frontend |
| `05_AI_Pipeline.md` | Audio processing and prompt specifications for SOAP & summaries |
| `06_Supabase_Setup.md` | Supabase specific configurations (RLS, Auth hooks, Storage buckets) |

## Location
Please build the Express.js project in: `d:\TalkAlign - Project\backend\`
