# InvAI / SmartStock

AI‑assisted academic inventory & community request/voting platform for Consolatrix College of Toledo City, Inc.

## ✨ Core Snapshots
- **Inventory** – Real‑time view of equipment lifecycle & supply stock.
- **Claims** – Users request usage; manager approvals create in‑use records & history.
- **Returns** – Equipment return & finalize flow keeps availability accurate.
- **Requests** – Community submits new item ideas; managers approve.
- **Voting** – Approved requests appear on a board; peers vote to prioritize.
- **Conversion** – Managers turn winning requests directly into inventory entries.
- **History** – Unified log of status changes + claims + decisions.
- **Forecast** – Simple AI-ish hints (extensible) for supply depletion planning.

## 👥 Roles (Quick Read)
| Role     | Summary |
|----------|---------|
| Student  | Request, vote, claim items; view own history. |
| Teacher  | Same as student; academic facilitation. |
| Staff    | Operational support; usage similar to teacher. |
| Manager  | Approve requests/claims/returns, manage statuses, convert voted items. |
| Admin    | Global oversight, user management, full analytics. |

## 🔄 Flow Mini‑Map
`Request → Approve → Vote → Convert → Track Usage / Returns → Forecast → Repeat`

## ✅ Best Practices
1. Be clear & concise when submitting a new request.
2. Avoid duplicating existing requests—vote instead.
3. Return equipment promptly to free availability.
4. Managers: convert high‑impact winners early.
5. Admins: watch trend & claim patterns for resource strain.

## 🏗 Architecture
```
root
├── backend (Node.js / Express / PostgreSQL)
│   ├── sql/ (incremental schema migrations) 
│   ├── src/
│   │   ├── models/ (inventory, requests, claims, voting)
│   │   ├── routes/ (REST endpoints, auth, inventory, voting)
│   │   ├── middleware/ (auth / role)
│   │   ├── scripts/ (ensureAdmin seed)
│   │   └── server.js
├── frontend (React + Vite)
│   ├── src/
│   │   ├── pages/ (dashboards, about, manager tools, requests, voting)
│   │   ├── components/ (layout, analytics, modals, UI)
│   │   ├── services/ (api clients)
│   │   ├── context/ (auth)
│   │   ├── theme/ (role color scheme)
│   │   └── utils/ (avatar helpers)
└── README.md
```

### Backend Highlights
- Role‑aware queries (department + course scoping for managers)
- Unified status history: equipment statuses + claim attribution
- Request voting + weekly top retrieval
- Conversion endpoint (approved voted request → inventory item transaction)
- Avatar upload via Multer; default avatar fallback

### Frontend Highlights
- Responsive slide‑in sidebar (mobile)
- Animated About page with design system
- Manager voting dashboard (view + convert + delete)
- Inventory list limiting w/ “See All” toggles
- Full request history (user perspective) & conversion flow
- Global Roboto font + consistent typography

## 🔐 Authentication & Roles
- JWT-based auth (HTTP headers)
- Middleware checks attach `req.user` and enforce role permissions
- Manager scope limited to their department/course; Admin is global

## 🚀 Running Locally
Prerequisites: Node.js (LTS) + PostgreSQL

1. Install dependencies
```
cd backend && npm install
cd ../frontend && npm install
```
2. Database: create a database and apply SQL in `backend/sql` sequentially (or implement simple migration runner if present).
3. Environment variables (backend `.env`):
```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/invai
JWT_SECRET=replace_with_long_random_secret
ASSET_BASE_URL=http://localhost:5000
```
4. Start dev servers (two terminals):
```
cd backend && npm run dev
cd frontend && npm run dev
```
5. Ensure an admin user exists:
```
cd backend && npm run ensure-admin
```

## 🧪 Key API Areas (High-Level)
- `POST /auth/login` — issue JWT
- `GET /inventory/...` — inventory browsing & analytics
- `POST /requests` / `GET /requests` — user request lifecycle
- `POST /requests/:id/vote` (if implemented) / voting fetch endpoints
- `POST /requests/:id/convert` — manager conversion
- `GET /inventory/status-history/:itemId` — combined lifecycle + claim attribution

## 📊 Analytics & Voting
- Separate Equipment vs Supplies charts (with statuses: Available, In Use, For Repair, Disposed)
- Weekly Top Request endpoint for managers
- Time‑series and categorical expansions easily extendable

## 🖼 Avatar Handling
- Upload endpoint accepts image via Multer
- Fallback to default placeholder if user has not uploaded
- Utility: `getAvatarUrl(user)` builds correct absolute path

## 📱 Mobile Responsiveness
- Sidebar transforms to slide‑in panel ≤ 860px
- Overlay + body scroll lock when open
- Adaptive spacing & one‑column collapses (extendable to charts/tables)

## 🔮 Future Enhancements (Ideas)
- Dark mode (prefers-color-scheme aware)
- Progressive Web App (offline access / Add to Home Screen)
- Advanced forecasting with historical consumption curves
- Notification center & real-time updates (WebSockets)
- Accessibility pass (WCAG focus states, ARIA landmarks)

## 🙌 Attribution
Developed by: **Mae Ann Abellon**  
Made with help from **Copilot GPT-5**  
Consolatrix College of Toledo City, Inc.

## 📄 License
Currently unpublished license (private academic project). Add your chosen open-source license here if you plan to make it public.

---
> Have an idea or found an issue? Open an Issue or start a Discussion once the repo is public.
