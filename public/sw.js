/* Fey service worker — push notifications only (no offline caching yet). */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_err) {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Fey";
  const options = {
    body: payload.body || "Today's topic is waiting. You have 90 seconds.",
    icon: payload.icon || "/icons/fey-icon-192.png",
    badge: payload.badge || "/icons/fey-icon-192.png",
    // Same tag replaces an older unread reminder instead of stacking them.
    tag: payload.tag || "fey-daily",
    renotify: Boolean(payload.renotify),
    data: {
      url: payload.url || "/",
      template: payload.template || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL(data.url || "/", self.location.origin);
  target.searchParams.set("source", "push");
  if (data.template) target.searchParams.set("template", data.template);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target.href);
          return;
        }
      }
      await self.clients.openWindow(target.href);
    })()
  );
});
