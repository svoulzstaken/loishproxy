"use strict";

const shortcuts = {
	// Discord
	"discord": "https://discord.com/app",
	"disco": "https://discord.com/app",
	"discord login": "https://discord.com/login",
	"discord app": "https://discord.com/app",
	"discord signup": "https://discord.com/register",
	// YouTube
	"yt": "https://www.youtube.com",
	"youtube": "https://www.youtube.com",
	"yt music": "https://music.youtube.com",
	// Roblox
	"roblox": "https://www.roblox.com",
	"rblx": "https://www.roblox.com",
	"roblox login": "https://www.roblox.com/login",
	// TikTok / Snapchat / Socials
	"snapchat": "https://web.snapchat.com",
	"snap": "https://web.snapchat.com",
	"tiktok": "https://www.tiktok.com",
	"tt": "https://www.tiktok.com",
	"instagram": "https://www.instagram.com",
	"insta": "https://www.instagram.com",
	"ig": "https://www.instagram.com",
	"twitter": "https://x.com",
	"x": "https://x.com",
	"reddit": "https://www.reddit.com",
	"twitch": "https://www.twitch.tv",
	// AI
	"chatgpt": "https://chatgpt.com",
	"gpt": "https://chatgpt.com",
	"openai": "https://chatgpt.com",
	"claude": "https://claude.ai",
	// Games & Entertainment
	"crazygames": "https://www.crazygames.com",
	"poki": "https://poki.com",
	"chess": "https://www.chess.com",
	"nowgg": "https://now.gg",
	"github": "https://github.com",
	"spotify": "https://open.spotify.com",
	"soundcloud": "https://soundcloud.com",
	"netflix": "https://www.netflix.com",
};

/**
 * @param {string} input
 * @param {string} template Template for a search query.
 * @returns {string} Fully qualified URL
 */
function search(input, template) {
	if (!input) return "https://duckduckgo.com";

	const clean = input.trim().toLowerCase();

	// 1. Direct Keyword / Shortcut match
	if (shortcuts[clean]) {
		return shortcuts[clean];
	}

	// 2. Already full URL (https://..., http://...)
	try {
		return new URL(input.trim()).toString();
	} catch (err) {}

	// 3. Domain with extension (e.g. google.com, youtube.com, discord.gg, netflix.com/browse)
	try {
		const candidate = `https://${input.trim()}`;
		const url = new URL(candidate);
		// Check if it has a valid-looking domain name (contains dot and no spaces)
		if (url.hostname.includes(".") && !input.trim().includes(" ")) {
			return url.toString();
		}
	} catch (err) {}

	// 4. Everything else (queries like "how to do math", "cool games", etc.)
	// Uses DuckDuckGo HTML light search which embeds cleanly without breaking
	return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(input.trim())}`;
}
