
const Queue = require('queue-fifo');

const queue = new Queue();
const QueueUtil = () => { };
QueueUtil.sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});
async function processQueue() {
  while (true) {
    if (!queue.isEmpty()) {
      const item = queue.peek();
      if (item.cb && item.args) {
        await item.cb.apply(null, item.args);
      }
      queue.dequeue();
    } else {
      await QueueUtil.sleep(100);
    }
  }
}
processQueue();
QueueUtil.addQueue = (cb, ...args) => {
  queue.enqueue({ cb, args });
};
module.exports = QueueUtil;