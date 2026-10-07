import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@/lib/auth";
import { 
  getVideoFallbackForMission, 
  normalizeVideoMissionId 
} from "@/lib/videoFallbackData";

interface YouTubeSearchResult {
  videoId: string;
  embedUrl: string;
  title: string;
  concept: string;
  description: string;
  channelTitle?: string;
  keyTips: string[];
  source: "youtube_api" | "curated_fallback";
}

/**
 * Searches YouTube Data API v3 if key is present, otherwise falls back gracefully
 */
async function queryYouTubeOrFallback(
  missionId: string,
  topicQuery?: string
): Promise<YouTubeSearchResult | null> {
  const fallback = getVideoFallbackForMission(missionId);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!fallback) {
    return null;
  }

  if (!apiKey) {
    return {
      videoId: fallback.youtubeVideoId,
      embedUrl: fallback.embedUrl,
      title: fallback.title,
      concept: fallback.concept,
      description: fallback.description,
      keyTips: fallback.keyTips,
      source: "curated_fallback",
    };
  }

  try {
    const query = topicQuery?.trim() || fallback.searchQuery;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&videoEmbeddable=true&maxResults=1&key=${apiKey}`;

    const res = await fetch(youtubeUrl, {
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      console.warn(
        `[YOUTUBE_API_WARN] YouTube API returned ${res.status}. Using curated fallback.`
      );
      return {
        videoId: fallback.youtubeVideoId,
        embedUrl: fallback.embedUrl,
        title: fallback.title,
        concept: fallback.concept,
        description: fallback.description,
        keyTips: fallback.keyTips,
        source: "curated_fallback",
      };
    }

    const data = await res.json();
    const firstItem = data?.items?.[0];

    if (!firstItem?.id?.videoId) {
      console.warn(
        "[YOUTUBE_API_WARN] No video items found in search response. Using curated fallback."
      );
      return {
        videoId: fallback.youtubeVideoId,
        embedUrl: fallback.embedUrl,
        title: fallback.title,
        concept: fallback.concept,
        description: fallback.description,
        keyTips: fallback.keyTips,
        source: "curated_fallback",
      };
    }

    return {
      videoId: firstItem.id.videoId,
      embedUrl: `https://www.youtube.com/embed/${firstItem.id.videoId}`,
      title: firstItem.snippet.title || fallback.title,
      concept: fallback.concept,
      description: firstItem.snippet.description || fallback.description,
      channelTitle: firstItem.snippet.channelTitle,
      keyTips: fallback.keyTips,
      source: "youtube_api",
    };
  } catch (err: any) {
    console.warn(
      `[YOUTUBE_API_EXCEPTION] ${err?.message || err}. Using curated fallback.`
    );
    return {
      videoId: fallback.youtubeVideoId,
      embedUrl: fallback.embedUrl,
      title: fallback.title,
      concept: fallback.concept,
      description: fallback.description,
      keyTips: fallback.keyTips,
      source: "curated_fallback",
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const missionId = body?.missionId || "moon-1";
    const topic = body?.topic;
    const failureCount = Number(body?.failureCount) || 5;

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const video = await queryYouTubeOrFallback(missionId, topic);

    if (!video) {
      return NextResponse.json({
        ok: false,
        error: "No video fallback available for this mission",
        missionId,
        failureCount,
      });
    }

    // If student is logged in, log intervention to database
    if (userId) {
      try {
        await prisma.interventionLog.create({
          data: {
            userId,
            missionId: normalizeVideoMissionId(missionId),
            errorType: "5_failed_attempts_video_fallback",
            hintId: `video_${video.videoId}`,
            promptVersion: "youtube_v1",
            confidence: "high",
            fallbackUsed: video.source === "curated_fallback",
          },
        });
      } catch (dbErr) {
        console.warn("[VIDEO_QUERY_DB_LOG_FAIL]", dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      video,
      missionId,
      failureCount,
    });
  } catch (err: any) {
    console.error("[VIDEO_QUERY_ROUTE_ERROR]", err);
    // Even on server error, return curated fallback so UI never breaks
    const fallback = getVideoFallbackForMission("mars-1");
    if (!fallback) {
      return NextResponse.json({ ok: false, error: "System error" }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      video: {
        videoId: fallback.youtubeVideoId,
        embedUrl: fallback.embedUrl,
        title: fallback.title,
        concept: fallback.concept,
        description: fallback.description,
        keyTips: fallback.keyTips,
        source: "curated_fallback",
      },
      missionId: "mars-1",
      failureCount: 5,
    });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const missionId = searchParams.get("missionId") || "moon-1";
  const topic = searchParams.get("topic") || undefined;
  const failureCount = Number(searchParams.get("failureCount")) || 5;

  const video = await queryYouTubeOrFallback(missionId, topic);

  if (!video) {
    return NextResponse.json({
      ok: false,
      error: "No video fallback available for this mission",
      missionId,
      failureCount,
    });
  }

  return NextResponse.json({
    ok: true,
    video,
    missionId,
    failureCount,
  });
}
