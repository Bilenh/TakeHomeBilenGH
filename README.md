# TakeHomeBilenGH

Playwright tests for login and dashboard flows. Runs locally and in GitHub Actions.

## Dependencies

- **Node.js** (v18+; v20 recommended)
- **npm** (comes with Node)

Install project dependencies (including Playwright and dotenv):

```bash
npm install
```

This installs:

- `@playwright/test` – test runner and browser automation  
- `dotenv` – loads environment variables from `.env` and `env/prod.env`  
- `@types/node` – TypeScript types for Node

Install Playwright browsers (once per machine):

```bash
npx playwright install
```

## Environment variables

### Local runs

For local runs, the tests read variables from the **`env`** folder. The repo does **not** commit this folder (it is in `.gitignore`).

1. Create a folder named **`env`** in the project root (if it does not exist).
2. Inside `env`, create a file **`prod.env`** with the following variables (replace with your own values):

```env
BASE_URL=https://www.abcdef.com/
LOGIN_URL=https://id.abcdef.com/sign-in
HOME_PAGE=https://www.abcdef.com/c
VALID_EMAIL=your-email@example.com
VALID_PASSWORD=your-password
```

- `BASE_URL` – main site URL (e.g. abcdef homepage).  
- `LOGIN_URL` – sign-in page URL.  
- `HOME_PAGE` – URL of the app home/dashboard after login.  
- `VALID_EMAIL` – email used to log in.  
- `VALID_PASSWORD` – password used to log in.

Without these, the login test will skip or fail. **Do not commit `env/prod.env`**; keep it local only.

### GitHub Actions (CI)

For CI, the same values must be provided as **repository secrets** so they are never stored in the repo.

1. Open the repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Add the following **Secrets** (name must match exactly):

| Secret name   | Description                          |
|---------------|--------------------------------------|
| `BASE_URL`    | Main site URL (e.g. abcdef homepage) |
| `LOGIN_URL`   | Sign-in page URL                     |
| `HOME_PAGE`   | Dashboard/home URL after login       |
| `VALID_EMAIL` | Login email                          |
| `VALID_PASSWORD` | Login password                    |

The workflow (`.github/workflows/playwright.yml`) maps these secrets into the job `env`; no code changes are needed once the secrets exist.

## Running tests

Run all tests:

```bash
npm run test
```

Or with Playwright directly:

```bash
npx playwright test
```

Run only the login test file:

```bash
npm run test:login
```

Or:

```bash
npx playwright test tests/login.spec.ts
```

## Viewing the report

After a run, Playwright generates an HTML report in the `playwright-report/` folder.

**Open the report in the browser:**

```bash
npx playwright show-report
```

This starts a small server and opens the report. You can also open `playwright-report/index.html` directly in your browser.

## CI report (GitHub Actions)

On every run (pass or fail), the workflow zips the report and uploads it as an artifact.

1. Go to the **Actions** tab → select the workflow run.  
2. In **Artifacts**, download **playwright-report**.  
3. Unzip the file.  
4. Open **`index.html`** in your browser.

The report is the same as for local runs (tests, steps, timing). Traces are disabled in CI to keep the artifact size down.

## Optional: run in headed mode

To see the browser window while tests run:

```bash
npx playwright test --headed
``
