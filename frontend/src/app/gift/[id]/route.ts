type GiftData = {
  _id: string;
  type: "text" | "audio" | "video";
  content: string;
  createdAt: string;
};

type GiftResponse = {
  success: boolean;
  data?: GiftData;
};

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const getGiftApiBase = () => {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:5000/api";

  return `${configured.replace(/\/api\/?$/, "")}/api`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

async function loadGift(id: string): Promise<GiftData | null> {
  try {
    const res = await fetch(`${getGiftApiBase()}/gift/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as GiftResponse;
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

const renderGiftBody = (gift: GiftData) => {
  if (gift.type === "audio") {
    return `
      <p class="label">A voice message for you</p>
      <audio controls src="${escapeHtml(gift.content)}"></audio>
    `;
  }

  if (gift.type === "video") {
    return `
      <p class="label">A video message for you</p>
      <video controls src="${escapeHtml(gift.content)}"></video>
    `;
  }

  return `<p class="message">${escapeHtml(gift.content)}</p>`;
};

const renderPage = (gift: GiftData | null) => {
  const body = gift
    ? `
      <p class="eyebrow">Zyvora Gift Message</p>
      <h1>You received a gift</h1>
      ${renderGiftBody(gift)}
      <p class="date">Sent on ${new Date(gift.createdAt).toLocaleDateString("en-IN")}</p>
    `
    : `
      <p class="error">Could not load gift</p>
      <p class="hint">Please check that your phone is on the same Wi-Fi and scan again.</p>
    `;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Zyvora Gift</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: #fdf6f0;
        color: #3d1010;
        font-family: Georgia, "Times New Roman", serif;
      }
      .card {
        width: min(100%, 480px);
        padding: 32px 28px;
        border: 1px solid rgba(139,26,47,0.14);
        border-radius: 16px;
        background: #fff;
        box-shadow: 0 14px 42px rgba(139,26,47,0.10);
        text-align: center;
      }
      .eyebrow {
        margin: 0 0 8px;
        color: #a07070;
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0 0 24px;
        color: #8b1a2f;
        font-size: 28px;
        line-height: 1.2;
      }
      .message {
        margin: 0;
        color: #3d1010;
        font-size: 18px;
        line-height: 1.75;
        white-space: pre-wrap;
      }
      .label {
        margin: 0 0 12px;
        color: #6f4b4b;
        font-size: 16px;
      }
      audio, video {
        width: 100%;
      }
      video {
        max-height: 360px;
        border-radius: 12px;
        background: #111;
      }
      .date {
        margin: 24px 0 0;
        color: #a07070;
        font-size: 13px;
      }
      .error {
        margin: 0 0 8px;
        color: #8b1a2f;
        font-size: 18px;
        font-weight: 700;
      }
      .hint {
        margin: 0;
        color: #a07070;
        font-size: 15px;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main class="card">${body}</main>
  </body>
</html>`;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const gift = await loadGift(id);

  return new Response(renderPage(gift), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
