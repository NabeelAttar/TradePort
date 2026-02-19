const { spawn } = require("child_process");
const net = require("net");

function waitForPort(port) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const socket = new net.Socket();
      socket
        .once("connect", () => {
          clearInterval(interval);
          socket.destroy();
          resolve();
        })
        .once("error", () => {
          socket.destroy();
        })
        .connect(port, "127.0.0.1");
    }, 1000);
  });
}

function run(command) {
  return spawn("powershell", ["-Command", command], {
    stdio: "inherit",
  });
}

(async () => {
  run("nx serve @trade-port/product-service");
  await waitForPort(6002);

  run("nx serve auth-service");
  await waitForPort(6001);

  run("nx serve @trade-port/kafka-service");

  run("nx serve @trade-port/api-gateway");
})();
