/**
 * Push Notifications — Service Worker
 *
 * Handles incoming push events, displays notifications, and manages
 * notification click / close interactions. This file must be served from
 * the site root (e.g. `public/service-worker.js`) so that its scope
 * covers the entire origin.
 *
 * Self-contained — no imports or external dependencies.
 */

// ---------------------------------------------------------------------------
// Push event — display the notification
// ---------------------------------------------------------------------------

self.addEventListener("push", function (event) {
  if (!event.data) {
    return;
  }

  /** @type {{ title: string, body?: string, icon?: string, badge?: string, image?: string, data?: Record<string, unknown>, actions?: Array<{ action: string, title: string, icon?: string }>, tag?: string, requireInteraction?: boolean }} */
  var payload;

  try {
    payload = event.data.json();
  } catch (_err) {
    // If the payload is not valid JSON, use the raw text as the body.
    payload = {
      title: "Notification",
      body: event.data.text(),
    };
  }

  var title = payload.title || "Notification";

  var options = {
    body: payload.body || "",
    icon: payload.icon || undefined,
    badge: payload.badge || undefined,
    image: payload.image || undefined,
    data: payload.data || {},
    actions: payload.actions || [],
    tag: payload.tag || undefined,
    requireInteraction: payload.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ---------------------------------------------------------------------------
// Notification click — open or focus the target URL
// ---------------------------------------------------------------------------

self.addEventListener("notificationclick", function (event) {
  var notification = event.notification;
  var data = notification.data || {};

  // Close the notification regardless of what happens next.
  notification.close();

  // Determine the target URL. Action clicks can carry their own URL in
  // `data.actions[action]`, otherwise fall back to `data.url`, then root.
  var targetUrl = "/";

  if (event.action && data.actions && data.actions[event.action]) {
    targetUrl = data.actions[event.action];
  } else if (data.url) {
    targetUrl = data.url;
  }

  // Try to focus an existing window/tab at the target URL. If none is
  // found, open a new one.
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there is already an open tab at the target URL.
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }

        // No existing tab — open a new window.
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ---------------------------------------------------------------------------
// Notification close — optional analytics hook
// ---------------------------------------------------------------------------

self.addEventListener("notificationclose", function (event) {
  var data = event.notification.data || {};

  // If you have an analytics endpoint, you can beacon a "dismissed" event
  // here. Example:
  //
  // if (data.analyticsUrl) {
  //   fetch(data.analyticsUrl, {
  //     method: "POST",
  //     body: JSON.stringify({ event: "dismissed", tag: event.notification.tag }),
  //     keepalive: true,
  //   });
  // }

  // Intentionally a no-op by default. Extend as needed.
  void data;
});
