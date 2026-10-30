// Free backend: saves each website enquiry as a row in the Google Sheet this script is attached to.
const SHEET_NAME = "Enquiries";
const ENQUIRY_HEADERS = ["Received","Name","Mobile","Email","Check-in","Check-out","Guests","Message"];
const INSTAGRAM_GRAPH_VERSION = "v26.0";
const INSTAGRAM_FEED_CACHE_KEY = "instagram-feed-v1";
function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    if (!e || !e.postData || !e.postData.contents) return out({ok:false, error:"missing_fields"});
    const d = JSON.parse(e.postData.contents);
    if (!d.name || !d.mobile || !d.checkin || !d.checkout) return out({ok:false, error:"missing_fields"});
    const guests = Number(d.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 30 || d.checkout <= d.checkin) {
      return out({ok:false, error:"invalid_fields"});
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(ENQUIRY_HEADERS);
    } else {
      const headers = sh.getRange(1, 1, 1, ENQUIRY_HEADERS.length).getDisplayValues()[0];
      if (ENQUIRY_HEADERS.some(function(header, index) { return headers[index] !== header; })) {
        Logger.log("Enquiry save stopped: Enquiries sheet headers do not match the expected schema.");
        return out({ok:false, error:"sheet_headers_mismatch"});
      }
    }
    sh.appendRow([
      new Date(), t(d.name), t(d.mobile), t(d.email), t(d.checkin),
      t(d.checkout), guests, t(d.message)
    ]);
    return out({ok:true});
  } catch (err) {
    Logger.log("Enquiry save error: " + err.message);
    return out({ok:false, error:"server"});
  } finally {
    if (locked) lock.releaseLock();
  }
}
function doGet(e) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback) {
    if (callback !== "revosOasisInstagramFeed") return jsonp("revosOasisInstagramFeed", {ok:false, error:"invalid_callback"});
    return instagramFeed();
  }
  return out({ok:true, service:"revos-oasis-enquiries"});
}
function instagramFeed() {
  const callback = "revosOasisInstagramFeed";
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(INSTAGRAM_FEED_CACHE_KEY);
    if (cached) return jsonp(callback, JSON.parse(cached));

    const properties = PropertiesService.getScriptProperties();
    const userId = properties.getProperty("INSTAGRAM_USER_ID");
    const accessToken = properties.getProperty("INSTAGRAM_ACCESS_TOKEN");
    if (!userId || !accessToken) throw new Error("Instagram feed credentials are not configured.");

    const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
    const url = "https://graph.facebook.com/" + INSTAGRAM_GRAPH_VERSION + "/" +
      encodeURIComponent(userId) + "/media?fields=" + encodeURIComponent(fields) +
      "&limit=8&access_token=" + encodeURIComponent(accessToken);
    const response = UrlFetchApp.fetch(url, {muteHttpExceptions:true});
    const status = response.getResponseCode();
    if (status < 200 || status >= 300) throw new Error("Instagram Graph API returned HTTP " + status + ".");

    const apiResult = JSON.parse(response.getContentText());
    if (apiResult.error) throw new Error(apiResult.error.message || "Instagram Graph API request failed.");
    const posts = Array.isArray(apiResult.data) ? apiResult.data.map(function(post) {
      return {
        caption: String(post.caption || "").slice(0, 300),
        media_type: String(post.media_type || ""),
        media_url: String(post.media_url || ""),
        permalink: String(post.permalink || ""),
        thumbnail_url: String(post.thumbnail_url || ""),
        timestamp: String(post.timestamp || "")
      };
    }) : [];
    const result = {ok:true, posts:posts};
    cache.put(INSTAGRAM_FEED_CACHE_KEY, JSON.stringify(result), 600);
    return jsonp(callback, result);
  } catch (err) {
    Logger.log("Instagram feed error: " + err.message);
    return jsonp(callback, {ok:false, error:"instagram_feed_unavailable"});
  }
}
function t(v) { let s = String(v || "").slice(0, 1000); return /^[=+\-@]/.test(s) ? "'" + s : s; }  // blocks formula injection
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function jsonp(callback, value) {
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(value) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
