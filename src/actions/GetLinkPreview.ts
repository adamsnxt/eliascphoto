"use server";

import sharp from "sharp";

export interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string;
  textColor: "#000" | "#fff";
}

function getTextColor(r: number, g: number, b: number): "#000" | "#fff" {
  const channel = (value: number) => {
    const normalized = value / 255;

    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

  const whiteContrast = 1.05 / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;

  return whiteContrast >= blackContrast * 0.85 ? "#fff" : "#000";
}

async function analyzeImage(imageUrl: string): Promise<"#000" | "#fff"> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return "#fff";
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const image = sharp(buffer).resize(64, 64, {
      fit: "cover",
      position: "top",
    });

    const { dominant } = await image.stats();

    return getTextColor(dominant.r, dominant.g, dominant.b);
  } catch (error) {
    console.error("No se pudo analizar la imagen:", error);

    return "#fff";
  }
}

export async function getLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const getMeta = (property: string) => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["'][^>]*>`,
        "i",
      );

      return html.match(regex)?.[1] ?? null;
    };

    const image = getMeta("og:image");

    const imageUrl = image ? new URL(image, parsedUrl).toString() : null;

    const textColor = imageUrl ? await analyzeImage(imageUrl) : "#fff";

    return {
      title:
        getMeta("og:title") ??
        html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] ??
        null,

      description: getMeta("og:description"),

      image: imageUrl,

      url: getMeta("og:url") ?? parsedUrl.toString(),

      textColor,
    };
  } catch {
    return null;
  }
}
