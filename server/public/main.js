/*global UIkit, Vue */

(() => {
  const notification = (config) =>
    UIkit.notification({
      pos: "top-right",
      timeout: 5000,
      ...config,
    });

  const alert = (message) =>
    notification({
      message,
      status: "danger",
    });

  const info = (message) =>
    notification({
      message,
      status: "success",
    });

  const fetchJson = (...args) =>
    fetch(...args)
      .then((res) =>
        res.ok
          ? res.status !== 204
            ? res.json()
            : null
          : res.text().then((text) => {
              throw new Error(text);
            })
      )
      .catch((err) => {
        alert(err.message);
      });

  new Vue({
    el: "#app",
    data: {
      authenticated:
        typeof window.AUTH_TOKEN === "string" && window.AUTH_TOKEN.length > 0,
      loginUser: "",
      loginPass: "",
      desc: "",
      activeTimers: [],
      oldTimers: [],
    },
    methods: {
      doLogin() {
        fetchJson("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: this.loginUser,
            password: this.loginPass,
          }),
        }).then((data) => {
          if (data && !data.error) {
            window.location.reload();
          } else if (data && data.error) {
            alert(data.error);
          }
        });
      },
      doSignup() {
        fetchJson("/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: this.loginUser,
            password: this.loginPass,
          }),
        }).then((data) => {
          if (data !== undefined && data !== null) {
            info("Регистрация выполнена. Войдите.");
          }
        });
      },
      doLogout() {
        fetchJson("/logout", {
          credentials: "include",
        }).then(() => {
          window.location.reload();
        });
      },
      createTimer() {
        const description = this.desc;
        this.desc = "";
        fetchJson("/api/timers", {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }),
        }).then((body) => {
          if (body && body.id) {
            info(`Создан таймер «${description}» [${body.id}]`);
          }
        });
      },
      stopTimer(id) {
        fetchJson(`/api/timers/${id}/stop`, {
          method: "post",
          credentials: "include",
        }).then(() => {
          info(`Таймер остановлен [${id}]`);
        });
      },
      formatTime(ts) {
        return new Date(ts).toTimeString().split(" ")[0];
      },
      formatDuration(d) {
        if (d == null || Number.isNaN(d)) {
          return "—";
        }
        d = Math.floor(d / 1000);
        const s = d % 60;
        d = Math.floor(d / 60);
        const m = d % 60;
        const h = Math.floor(d / 60);
        return [h > 0 ? h : null, m, s]
          .filter((x) => x !== null)
          .map((x) => (x < 10 ? "0" : "") + x)
          .join(":");
      },
    },
    created() {
      if (!this.authenticated || !window.AUTH_TOKEN) {
        return;
      }
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/ws?sessionId=${encodeURIComponent(window.AUTH_TOKEN)}`
      );
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "all_timers") {
          this.activeTimers = msg.active || [];
          this.oldTimers = msg.old || [];
        } else if (msg.type === "active_timers") {
          this.activeTimers = msg.payload || [];
        }
      };
      ws.onerror = () => {
        alert("Ошибка WebSocket");
      };
    },
  });
})();
