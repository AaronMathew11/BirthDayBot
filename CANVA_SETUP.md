# Canva API Integration Setup

## Required Environment Variables

Add these to your Vercel environment variables:

```bash
CANVA_API_TOKEN=your_canva_api_token_here
CANVA_TEMPLATE_ID=your_template_id_here
```

## Setup Steps

### 1. Get Canva API Access
- Visit [Canva Developers](https://www.canva.com/developers/)
- Sign up for API access
- Create a new app
- Get your API token

### 2. Create a Template
- Go to Canva and create a poster template
- Design it with placeholders for:
  - Person's name
  - "Happy Birthday!" / "Happy Anniversary!" text
  - Date
  - Photo placeholder
- Publish the template
- Get the template ID from the URL

### 3. Template Design Recommendations
- Use a standard poster size (A4 or custom)
- Leave space for text overlays:
  - Name: Top center, large font
  - Event type: Below name, medium font
  - Date: Below event type, smaller font
  - Photo: Right side or center, 200x200px area
- Use contrasting colors for text visibility
- Keep background simple for text readability

### 4. Environment Variable Setup
- Add the variables to your Vercel dashboard:
  - Go to your Vercel project
  - Settings → Environment Variables
  - Add both CANVA_API_TOKEN and CANVA_TEMPLATE_ID
  - Redeploy the application

## How It Works

When users run `/thisweek`:
1. Bot sends the regular text summary
2. For each person with a birthday/anniversary:
   - Creates a new design from your template
   - Uploads their photo (if available from Google Drive)
   - Adds personalized text (name, event type, date)
   - Exports as PNG image
   - Sends the poster to Telegram

## Fallback Behavior
- If Canva API is not configured, shows text-only messages
- If poster creation fails, sends fallback text message
- Includes error handling for rate limits and API issues

## Rate Limits
- Adds 2-second delay between poster generations
- Handles export polling with timeouts
- Graceful degradation on API failures