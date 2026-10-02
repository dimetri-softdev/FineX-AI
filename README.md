# FineX — Personal Finance Companion

FineX is an offline-first, cross-platform mobile application designed to help users track expenses, manage budgets, scan receipt data automatically, and gain real-time spending insights—all synced seamlessly across devices.

---

## Key Features

- **Offline-First Architecture**: Log transactions and update budgets anytime, anywhere. Local data syncs seamlessly with the cloud when connection is restored.
- **Smart Receipt Scanning (OCR)**: Snap a picture of receipts to automatically extract amounts, transaction dates, and merchant information using on-device text recognition.
- **Visual Analytics & Insights**: Interactive charts present spending patterns, category trends, and budget health at a glance.
- **Budget Tracking & Alerts**: Set custom category spending limits and receive automated notifications when approaching budget thresholds.
- **Multi-Device Synchronization**: Effortless background sync with conflict resolution keeps data consistent across mobile clients.
- **Data Privacy & Security**: Support for local biometric locking (Face ID / Fingerprint) and secure encrypted token storage.

---

## Tech Stack & Dependencies

| Component | Technology |
| :--- | :--- |
| **Framework** | React Native (Expo) / Flutter |
| **Local Database** | WatermelonDB / SQLite (OP-SQLite) |
| **State Management** | Zustand & TanStack Query / Riverpod |
| **Receipt Scanning** | Vision Camera + ML Kit Text Recognition |
| **Data Visualization** | Victory Native / `fl_chart` |
| **Backend & Sync** | Node.js / FastAPI / Supabase |

---

## Architecture Overview

FineX follows a decoupled multi-layer architecture to guarantee offline reliability and high UI performance:

┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│             (Screens, Components, Charts)               │
└────────────────────────────┬────────────────────────────┘
│
┌────────────────────────────▼────────────────────────────┐
│                  State Management Layer                 │
│         (Client Application State & Async Cache)        │
└───────────────┬─────────────────────────┬───────────────┘
│                         │
┌───────────────▼──────────────┐   ┌──────▼───────────────┐
│     Local Persistent DB      │   │   Sync & API Layer   │
│   (Offline Read/Write Ops)   │   │ (Queue & Endpoints)  │
└──────────────────────────────┘   └──────────────────────┘

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [React Native CLI / Expo CLI](https://docs.expo.dev/) or [Flutter SDK](https://docs.flutter.dev/)
- [Android Studio](https://developer.android.com/studio) / [Xcode](https://developer.apple.com/xcode/) (for device emulation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/finex-mobile.git](https://github.com/your-username/finex-mobile.git)
   cd finex-mobile

   Install client dependencies:

Bash
npm install
# or
yarn install
Configure Environment Variables:
Create a .env file in the root directory and add your API endpoints and keys:

Code snippet
API_BASE_URL=[https://api.finex.example.com](https://api.finex.example.com)
OCR_ENABLED=true
Run the application:

Bash
# For iOS
npm run ios

# For Android
npm run android

Database Schema Highlights
Core entities managed locally and synced with the backend API:

transactions — Stores expense and income logs (amount, category_id, date, receipt_url, sync_status).

categories — Classifies transactions (name, icon, color, type).

budgets — Tracks financial target limits (category_id, amount_limit, period).

License
Distributed under the MIT License. See LICENSE for more information.
