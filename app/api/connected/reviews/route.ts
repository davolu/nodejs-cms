import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Public: fetch Google reviews for a place using the owner's Places API key (server-side).
export async function GET(req: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  const placeId = req.nextUrl.searchParams.get('placeId')
  if (!key || !placeId) return NextResponse.json({ reviews: [], rating: null })
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,reviews&key=${key}`
    const r = await fetch(url)
    const d = await r.json()
    const res = d.result || {}
    const reviews = (res.reviews || []).map((rv: any) => ({ author: rv.author_name, rating: rv.rating, text: rv.text, when: rv.relative_time_description, photo: rv.profile_photo_url }))
    return NextResponse.json({ name: res.name || '', rating: res.rating ?? null, total: res.user_ratings_total ?? 0, reviews })
  } catch {
    return NextResponse.json({ reviews: [], rating: null })
  }
}
